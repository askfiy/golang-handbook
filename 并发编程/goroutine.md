# 基本介绍

## goroutine

并发任务是 Golang 中的一大杀器，而让 Golang 拥有超强并发能力的正是 goroutine。

goroutine 类似于其他编程语言中的协程，也就是用户态下的线程。

在其他编程语言中，线程的调度会交由 os 进行处理，但是在 Golang 中则会交由 runtime 运行时进行处理。

Golang runtime 运行时内置了调度处理、上下文切换等机制，这使得开发人员不必太过关注线程的运行情况，从而能够将更多的精力放在业务逻辑的处理上。

## 动态栈

操作系统中的线程都有固定的栈内存，一般为 2MB，这使得同时开启大量线程时会面临程序性能下降的问题。

但是 goroutine 在生命周期之初的栈内存一般只有 2KB，并且它会按需自动增加或缩小容量，最大的栈内存限制可以达到 1 GB。

一台普通的计算机同一时刻运行几十个线程其负载已经很高了，但是 Golang 却可以轻松创建百万个 goroutine，这使得使用 Golang 标准库中的 net 包写出的 go web server 性能直接可以媲美 nginx。

## GPM

GPM 是 Golang 运行时 runtime 层面实现的一套 goroutine 调度系统，释义如下：

- G 就是一个 goroutine
- P 是存放 G 的队列，可以有多个，按 CPU 核心数来决定
- M 是 P 的调度管理，每个 P 都对应 1 个 M， 而每个 M 都会映射 1 个 os 线程， P 中的 G 最后都会通过 M 在 os 线程上执行

其实在 GPM 调度系统中，不光只有 P 这 1 种队列来存放 G，还有 1 个全局的队列也会存放 G，这是因为每个 P 中存储 G 的容量是有限制的（最多 265），当所有 P 都被 G 存满之后，新存入的 G 会存放到全局队列中。

P 中的 G 一般情况下只会在其对应的 M 上执行。而全局队列中的 G 可能会被所有的 M 执行，这意味着全局队列中的 G 被操作时必须要加锁。

当一个 M 执行完其对应 P 中的所有 G 后，就会去全局队列中获取 G，如果全局队列中也没有 G 了，就会去其他的 P 中窃取 G 来执行。

当一个 G 长久阻塞在 一个 M 上时，runtime 会新建一个 M，阻塞 G 所在的 P 会将它的其他 G 挂在到新建的 M 上，当旧的 G 阻塞完成或者确认以死亡后 runtime 将回收旧的 M。

图示如下：

![goroutine-2022-01-07-16-37-18](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/goroutine-2022-01-07-16-37-18.png)

# 快速上手

## 并发任务

调用一个函数时，在函数调用前加上 go 关键字，那么该函数就会被当做独立的 goroutine 进行启动。

代码示例：

```
package main

import (
	"fmt"
	"time"
)

func task(taskNumber int) {
	fmt.Printf("task [%d] running ...\n", taskNumber)
}

func main() {
	fmt.Printf("main goroutine start ..\n")
	for i := 0; i < 10; i++ {
		go task(i)
	}
	// 主 goroutine 睡眠 1s
	time.Sleep(1 * time.Second)
	fmt.Printf("main goroutine end ..\n")
}


```

## 守护线程

在上面的例子中，我们为了使所有的子 goroutine 能够运行完毕，所以在主 goroutine 上调用了 time.Sleep 方法阻塞了主 goroutine 的执行。

这当然不是一个很好的解决办法，所幸 sync 包提供了主 goroutine 和子 goroutine 协同的功能。

代码示例：

```
package main

import (
	"fmt"
	"sync"
)

// 新增一个计数器
var wg sync.WaitGroup

func task(taskNumber int) {
	// 让计数器 - 1
	defer wg.Done()
	fmt.Printf("task [%d] running ...\n", taskNumber)
}

func main() {
	fmt.Printf("main goroutine start ..\n")
	for i := 0; i < 10; i++ {
		// 让计数器 + 1
		wg.Add(1)
		go task(i)
	}
	// 只有当计数器为 0 时，主 goroutine 才会继续运行
	// 否则主 goroutine 将会等待，类似于守护线程
	wg.Wait()
	fmt.Printf("main goroutine end ..\n")
}

```

# 任务控制

## 线程数量

runtime 包中提供了 GOMAXPROCS 方法，用来设定 os 最多能开启多少线程来执行所有的 goroutine。

换而言之，GOMAXPROCS 方法可以用来指定 P 和 M 的数量。

- Go 1.5 版本之前，默认使用的是单核心执行
- Go 1.5 版本之后，默认使用全部的 CPU 逻辑核心数

当线程数量过少，而 goroutine 过多时，runtime 会通过时间片轮询机制来抢占执行时机。

通过下面这个例子，你可以发现有的 goroutine 切换比较慢，而有的 goroutine 切换非常快，这就是依照时间片轮询策略进行的切换。

```
package main

import (
	"fmt"
	"runtime"
	"sync"
)

var wg sync.WaitGroup

func task(taskNumber int) {
	defer wg.Done()
	for i := 0; i < 1e+5; i++ {
		fmt.Printf("task [%d] run [%d] times\n", taskNumber, i+1)
	}
}

func main() {
	// 只开启一个 os 线程
	runtime.GOMAXPROCS(1)
	fmt.Printf("main goroutine start ..\n")
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go task(i)
	}
	wg.Wait()
	fmt.Printf("main goroutine end ..\n")
}
```

## 任务终止

通过 runtime 包中的 Goexit 方法，可以结束一个正在执行的 goroutine：

```
package main

import (
	"fmt"
	"runtime"
	"sync"
)

var wg sync.WaitGroup

func task(taskNumber int) {
	defer wg.Done()
	for i := 0; i < 1e+5; i++ {
		if i == 100 {
			// 结束 goroutine
			runtime.Goexit()
		}
		fmt.Printf("task [%d] run [%d] times\n", taskNumber, i+1)
	}
}

func main() {
	fmt.Printf("main goroutine start ..\n")
	for i := 0; i < 1000; i++ {
		wg.Add(1)
		go task(i)
	}
	wg.Wait()
	fmt.Printf("main goroutine end ..\n")
}
```
