# 任务池

一个 goroutine 任务在执行完成后会进行销毁，在 GPM 模型中， G 的数量是不固定的，而真正执行任务的 os 线程数量却是固定的，它取决于 CPU 的核心数。

如果一次性开启的 goroutine 是 CPU 核心数的很多倍，那么大量的 goroutine 启动、销毁、切换、执行权竞争会造成一些不必要的资源浪费。

最好的办法就是将 goroutine 池化，每次只开启与 CPU 核心数量相同的 goroutine。让这些 goroutine 不断的从某个任务通道中领取任务，直至任务通道清空后再进行销毁。

# 代码实现

代码实现非常简单，需要 2 个通道，分别是 task 任务通道和 result 结果通道。

代码示例：

```
package main

import (
	"fmt"
	"runtime"
	"sync"
)

var wg sync.WaitGroup

func add(x int, y int) int {
	return x + y
}

func main() {
	// 2 个任务通道
	taskChanel := make(chan []int, 100)
	resultChannel := make(chan int, 100)
	// 先开启特定数量的 goroutine
	cpuNumber := runtime.NumCPU()
	wg.Add(cpuNumber)
	for i := 0; i < cpuNumber; i++ {
		go func() {
			defer wg.Done()
			// 从任务通道中获取任务
			for task := range taskChanel {
				result := add(task[0], task[1])
				resultChannel <- result
			}
		}()
	}
	// 添加任务
	for i := 0; i < 10; i++ {
		taskChanel <- []int{i, i}
	}
	// 关闭任务通道，不需要存入数据了
	close(taskChanel)
	// 等待所有任务运行完成
	wg.Wait()
	// 关闭结果通道，不需要存入数据了
	close(resultChannel)
	// 查看任务结果
	for result := range resultChannel {
		fmt.Printf("result : %d\n", result)
	}
}
```

# 可复用的池

下面的代码是通过 reflect 反射库实现的可复用的一个 goroutine 池，能够更加方便的帮助我们进行 goroutine 池化。

由于利用了反射库，性能会略有下降，但使用比较方便：

```
package pool

import (
	"reflect"
	"runtime"
	"sync"
)

// goroutine 池结构体
type GoroutineExecutorPool struct {
	taskChanel chan map[string]interface{} // 任务通道
	wg         sync.WaitGroup              // 等待计数器
	cpuNumber  int                         // 当前 CPU 核心数
}

type GoroutineExecutorPoolInterface interface {
	Execute(fn interface{}, args []interface{}, cb interface{})
	ExecuteMany(fn interface{}, argsGroup [][]interface{}, cb interface{})
	WaitTaskEnd()
	getParams(args interface{}) []reflect.Value
	loop()
}

// 初始化一个结构体，并且开启循环，监听任务通道
func NewGoroutineExecutorPool() *GoroutineExecutorPool {
	goroutinePool := &GoroutineExecutorPool{
		taskChanel: make(chan map[string]interface{}, 100),
		cpuNumber:  runtime.NumCPU(),
	}
	goroutinePool.loop()
	return goroutinePool
}

// 提交 1 个任务
func (g *GoroutineExecutorPool) Execute(fn interface{}, args []interface{}, cb interface{}) {
	// 将任务、参数、回调函数以 interface{} 类型添加到任务通道中
	g.taskChanel <- map[string]interface{}{
		"fn":   fn,
		"args": args,
		"cb":   cb,
	}
}

// 提交 n 个任务
func (g *GoroutineExecutorPool) ExecuteMany(fn interface{}, argsGroup [][]interface{}, cb interface{}) {
	// 将任务、参数、回调函数以 interface{} 类型添加到任务通道中
	for _, args := range argsGroup {
		g.Execute(fn, args, cb)
	}
}

// 等待任务运行结束
func (g *GoroutineExecutorPool) WaitTaskEnd() {
	// 关闭通道、等待所有任务执行完成
	close(g.taskChanel)
	g.wg.Wait()
}

// 反射获取函数参数
func (g *GoroutineExecutorPool) getParams(args interface{}) []reflect.Value {
	params := []reflect.Value{}
	// 将 interface{} 转换为 []interface{} 并遍历
	for _, param := range args.([]interface{}) {
		params = append(params, reflect.ValueOf(param))
	}
	return params
}

// 任务通道循环
func (g *GoroutineExecutorPool) loop() {
	g.wg.Add(g.cpuNumber)
	for i := 0; i < g.cpuNumber; i++ {
		go func() {
			defer g.wg.Done()
			for functionMessage := range g.taskChanel {
				// 将 interface{} 反射成一个 function
				function := reflect.ValueOf(functionMessage["fn"])
				// 将 []interface{} 反射成一个 []reflect.Value 用于参数传递
				args := g.getParams(functionMessage["args"])
				// 获取回调函数
				cb := functionMessage["cb"]
				if cb != nil {
					// function 调用完成后，再次调用回调函数，回调函数的参数就是 function 运行完成后的结果
					reflect.ValueOf(cb).Call(function.Call(args))
				} else {
					// 直接调用 function、没有返回值、没有回调函数
					function.Call(args)
				}
			}
		}()
	}
}

```

使用示例，接收任意类型的参数以及指定 1 个回调函数：

```
package main

import (
	"demo/pool"
	"fmt"
)

func add(x int, y int) int {
	return x + y
}
func callbackfn(result int) {
	fmt.Printf("%d\n", result)
}

func main() {
	gp := pool.NewGoroutineExecutorPool()
	// 运行 1000 次 1 + 1 的结果
	for i := 0; i < 1000; i++ {
		gp.Execute(add, []interface{}{i, i}, callbackfn)
	}
	gp.WaitTaskEnd()
}
```

没有回调函数时，传入 nil 即可：

```
package main

import (
	"demo/pool"
	"fmt"
)

func add(x int, y int) {
	fmt.Printf("%d\n", x+y)
}

func main() {
	gp := pool.NewGoroutineExecutorPool()
	// 运行 add(1, 1)
	// 运行 add(2, 2)
	// 运行 add(3, 3)
	gp.ExecuteMany(add, [][]interface{}{
		{1, 1},
		{2, 2},
		{3, 3},
	}, nil)
	gp.WaitTaskEnd()
}
```
