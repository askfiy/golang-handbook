# 简单介绍

当多个 goroutine 之间需要进行数据交互时，必须使用某种安全类型的容器来承载数据，而通道就是 Golang 自带的一种先进先出的数据安全型容器。

通道本身是属于引用类型的数据结构，所以需要使用 make 函数对其进行初始化工作。

# 通道操作

通道的操作非常简单，如下所示：

| 操作            | 描述               |
| --------------- | ------------------ |
| chan <- data    | 将数据放入通道     |
| data := <- chan | 将通道中的数据取出 |
| close(chan)     | 关闭某个通道       |

当一个通道不需要再存入或者取出数据时，应该关闭该通道。

# 无缓冲通道(阻塞)

无缓冲通道即为阻塞通道，阻塞通道创建语法如下：

```
var 通道名称 = make(chan 通道类型)
```

对于无缓冲区通道来说，数据必须先取后存，并且必须将所有存入的数据取净，否则将会引发死锁异常。

图示如下：

![channel-2022-01-08-15-38-15](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/channel-2022-01-08-15-38-15.png)

代码示例：

```
package main

import (
	"fmt"
	"sync"
)

func task(number int, ch chan string, wg *sync.WaitGroup) {
	defer wg.Done()

	data, ok := <-ch
	if !ok {
		return
	}

	fmt.Printf("%#v\n", data)
}

func main() {

	var wg sync.WaitGroup

	// 定义一个无缓冲通道
	var ch = make(chan string)

	for i := 0; i < 3; i++ {
		wg.Add(1)
		// 必须先取数据
		go task(i+1, ch, &wg)
		// 然后再存入数据
		ch <- fmt.Sprintf("data %d", i+1)
	}

	// 关闭通道，不再需要存入数据了
	close(ch)

	wg.Wait()
}

// "data 1"
// "data 2"
// "data 3"
```

# 有缓冲通道(非阻塞)

有缓冲通道即为非阻塞通道，创建语法如下：

```
var 通道名称 = make(chan 通道类型, 缓冲大小)
```

对于有缓冲区通道来说，数据可以先取后存，也可以先存后取，并且存入的数据不用取净。

当通道缓冲区满了后，新的存值操作将被阻塞，直至有旧的数据从通道中被取出。

相较于无缓冲通道，有缓冲区通道使用会更多一些。

图示如下：

![channel-2022-01-08-15-18-03](https://images-1302522496.cos.ap-nanjing.myqcloud.com/img/channel-2022-01-08-15-18-03.png)

代码示例：

```
package main

import (
	"fmt"
	"sync"
)

func task(number int, ch chan string, wg *sync.WaitGroup) {
	defer wg.Done()

	data, ok := <-ch
	if !ok {
		return
	}

	fmt.Printf("%#v\n", data)
}

func main() {

	var wg sync.WaitGroup

	// 定义一个缓存大小为 3 的有缓冲通道
	var ch = make(chan string, 3)

	for i := 0; i < 3; i++ {
		wg.Add(1)
		// 也可以先存数据
		// ch <- fmt.Sprintf("data %d", i+1)
		// 取数据
		go task(i+1, ch, &wg)
		// 存入数据
		ch <- fmt.Sprintf("data %d", i+1)
	}

	// 关闭通道，不再需要存入数据了
	close(ch)

	wg.Wait()
}


// "data 1"
// "data 2"
// "data 3"
```

# 只读只取通道

将通道传递给某个函数时，我们希望该函数只能读，或者只能写该通道，可以像下面这样定义参数类型：

```
// 只读通道
func get (ch <-chan string){}

// 只写通道
func put (ch chan<- string){}
```

# 通道遍历

通过 for/range 遍历可以快速的取出通道中的所有数据：

```
package main

import (
	"fmt"
	"sync"
)

func main() {

	var wg sync.WaitGroup

	var ch = make(chan string)

	wg.Add(1)
	go func() {
		defer wg.Done()
		for data := range ch {
			fmt.Printf("%#v\n", data)
		}
	}()

	ch <- "A"
	ch <- "B"
	ch <- "C"

	close(ch)

	wg.Wait()
}

// "A"
// "B"
// "C"
```

而普通的 for 循环只能遍历有缓冲区的通道，因此不推荐使用：

```
package main

import (
	"fmt"
	"sync"
)

func main() {

	var wg sync.WaitGroup

	var ch = make(chan string, 3)

	wg.Add(1)
	go func() {
		defer wg.Done()
		for len(ch) > 0 {
			fmt.Printf("%#v\n", <-ch)
		}
	}()

	ch <- "A"
	ch <- "B"
	ch <- "C"

	close(ch)

	wg.Wait()
}

// "A"
// "B"
// "C"
```

# 可能发生的情况

在使用有缓冲区的通道时，可能发生下面这些情况。

| 通道操作 | 未初始化 | 通道内无数据 | 通道缓冲未满 | 通道缓冲已满 |
| -------- | -------- | ------------ | ------------ | ------------ |
| 取出数据 | 阻塞     | 阻塞         | 成功         | 成功         |
| 存入数据 | 阻塞     | 成功         | 成功         | 阻塞         |
| 关闭通道 | panic    | 成功         | 成功         | 成功         |

此外，重复关闭一个通道会引发 panic。
