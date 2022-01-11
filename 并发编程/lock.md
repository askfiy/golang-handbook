# 并发问题

多个 goroutine 在同时执行时，如果对同一个数据源进行修改那么会因为资源竞争产生数据同步的问题。

如下所示， 2 个 goroutine 同时对 1 个数据源做操作， goroutine1 对数据源 加 1e5，goroutine2 对数据源减 1e5，最后得到的结果却不是 0：

```
package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup
var number = 0

func main() {
	wg.Add(2)

	go func() {
		defer wg.Done()
		for i := 0; i < 1e5; i++ {
			number++
		}
	}()

	go func() {
		defer wg.Done()
		for i := 0; i < 1e5; i++ {
			number--
		}
	}()

	wg.Wait()
	fmt.Printf("%d\n", number)
}

// 4159
// 74126
// 88532
```

# 互斥锁

通过 sync 包提供的互斥锁可解决该问题。

- 一个 goroutine 加互斥锁期间，不会因为时间轮询机制释放掉执行权
- 整个程序会变为串行执行，性能损耗较大

代码示例：

```
package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup
var number = 0

// 获取互斥锁
var lock sync.Mutex

func main() {
	wg.Add(2)

	go func() {
		defer wg.Done()
		lock.Lock() // 加互斥锁
		for i := 0; i < 1e5; i++ {
			number++
		}
		lock.Unlock() // 释放互斥锁
	}()

	go func() {
		defer wg.Done()
		lock.Lock() // 加互斥锁
		for i := 0; i < 1e5; i++ {
			number--
		}
		lock.Unlock() // 释放互斥锁
	}()

	wg.Wait()
	fmt.Printf("%d\n", number)
}

// 0
// 0
// 0
```

# 读写锁

互斥锁是完全互斥的，加锁期间另外的 goroutine 不能读取或者写入，是完全隔绝的。

但实际上当多个 goroutine 访问同一个资源而不对其进行修改时，是不会产生数据同步问题的。

所以 sync 也提供了读写锁，读写锁相较于互斥锁在读多写少的场景下性能更高。

- 读锁：读的时候不能写，必须等读锁释放后才能写
- 写锁：写的时候不能读，必须等写锁释放后才能读

下面的示例中 goroutine1 会对 number 写入 1e5 次，而 goroutine2 会读取 number 1e5 次。

```
package main

import (
	"fmt"
	"sync"
	"time"
)

var wg sync.WaitGroup
var number = 0

// 获取读写锁
var lock sync.RWMutex

func main() {
	startTime := time.Now()
	wg.Add(2)

	go func() {
		defer wg.Done()
		for i := 0; i < 1e5; i++ {
			lock.Lock() // 加写锁，不能读了
			number++
			lock.Unlock() // 释放写锁，可以读了
		}
	}()

	go func() {
		defer wg.Done()
		for i := 0; i < 1e5; i++ {
			lock.RLock() // 加读锁，不能写了
			fmt.Printf("%d\n", number)
			lock.RUnlock() // 释放读锁，可以写了
		}
	}()

	wg.Wait()
	endTime := time.Now()
	fmt.Printf("run time : %v", endTime.Sub(startTime))
}

// 753.657978ms
```
