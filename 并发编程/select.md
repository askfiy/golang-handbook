# select/case

在很多场景下，我们需要操纵多个通道，当任意一个通道内有数据时我们都希望能够及时的取出该数据。

下面的代码虽然可以做到上面的要求，但是显得不够优雅和美观：

```
for {
    data, ok := <-ch1
    data, ok := <-ch2
    ...
}
```

select/case 语句专门用于操纵多个通道，当某个通道可读或者可写时，将执行 case 下的代码块：

- 如果有多个 case 条件同时被满足，那么会随机执行 1 个 case 下的代码块
- 如果所有 case 条件均不满足，那么会执行 default 下的代码块
- 如果一个 select 中没有 case，那么会阻塞 main 函数

代码示例：

```
package main

import "fmt"

func main() {
	ch := make(chan int, 5)
	i := 0
	for {
		select {
        // 通道可写时就写入
		case ch <- i:
			fmt.Printf("write : %d\n", i)
        // 通道可读时就取出
		case x := <-ch:
			fmt.Printf("read  : %d\n", x)
		default:
			fmt.Printf("not write and not read\n")
		}
		i++
	}
}
```

# 应用场景

最常见的的例子就是网络通信：

- server 端维护了一个 request channel 和 response channel
- 当有 client 端请求时，会将请求信息放在 request channel 中
- 当 server 端响应时，会将响应信息放在 response channel 中
- 通过 死循环 + select/case 的方式，server 可以不断的响应 client

代码模拟示例：

```
package main

import "fmt"

func main() {
	requestChannel := make(chan string, 10)
	responseChannel := make(chan string, 10)

	// 模拟 client 请求
	go func() {
		i := 0
		for {
			requestChannel <- fmt.Sprintf("请求 : %d", i)
			i++
		}
	}()

	// 模拟 server 处理
	for {
		select {
		case request := <-requestChannel:
			go func() {
				fmt.Printf("request : %#v\n", request)
				// 开始处理本次请求，并将结果写入响应通道
				responseChannel <- "响应"
			}()
		case response := <-responseChannel:
			go func() {
				fmt.Printf("response : %#v\n", response)
				// 回复给客户端
			}()
		default:
			fmt.Printf("No request\n")
		}
	}
}
```

下面还有一个应用场景，当有多个任务需要调用同一个回调函数时，将所有任务结果发送到不同的通道中，通过 select/case 来遍历多个任务结果的反馈通道并处理：

```
package main

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

func request2(ch1 chan<- string, wg *sync.WaitGroup) {
	defer wg.Done()

	var count = 1
	for {
		ch1 <- fmt.Sprintf("ch1 <- %d\n", count)
        // 阻塞 n 秒
		time.Sleep(time.Duration(rand.Intn(3)) * time.Second)
		count++
	}
}

func request1(ch2 chan<- string, wg *sync.WaitGroup) {
	defer wg.Done()

	var count = 1
	for {
		ch2 <- fmt.Sprintf("ch2 <- %d\n", count)
        // 阻塞 n 秒
		time.Sleep(time.Duration(rand.Intn(3)) * time.Second)
		count++
	}
}

func callback() {}

func main() {

	var wg sync.WaitGroup

	ch1 := make(chan string, 10)
	ch2 := make(chan string, 10)

	wg.Add(2)

	go request1(ch1, &wg)
	go request2(ch2, &wg)

	for {
        // 谁先返回先处理谁
		select {
		case response1 := <-ch1:
			fmt.Println(response1)
		case response2 := <-ch2:
			fmt.Println(response2)
		}
	}
}
```
