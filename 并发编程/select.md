# select/case

select/case 用于监听多个通道，当某个通道可读或者可写时，将执行 case 下的代码块：

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
		case ch <- i:
			fmt.Printf("write : %d\n", i)
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
