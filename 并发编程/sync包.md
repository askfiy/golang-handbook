# sync.Once

sync.Once 能够使多个 goroutine 中某个函数只运行一次，在进行资源懒加载时非常实用。

比如有 10 个 goroutine 都需要使用到 1 份相同的配置文件，通过 sync.once 让第 1 个启动的 goroutine 加载该文件，后续 goroutine 可以直接进行使用，而不必重复加载。

```
package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup
var once sync.Once

func load() {
	fmt.Println("load configure file ...")
}

func main() {
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// 只运行 1 次的函数不能有任何参数和返回值
			once.Do(load)
		}()
	}
	wg.Wait()
}

// load configure file ...
```

# sync.Map

Golang 内置的 map 不是并发安全的，但是 sync 包所提供的 map 却是并发安全的。

对于多个 goroutine 之间的数据通信而言，可以选择 channel 或者 sync.map 来实现。

此外，sync.map 不需要通过 make 函数进行内存的初始化工作，导入后直接使用即可，并且它比 channel 的操作更加简单。

以下是 sync.map 所提供的方法：

| 方法                                       | 描述                                       |
| ------------------------------------------ | ------------------------------------------ |
| Store(k, v)                                | 设置一组键值对                             |
| Load(k)                                    | 通过键取出值                               |
| LoadorStore(k, v)                          | 根据键取出值，如果没有该键则创建这组键值对 |
| Delete(k)                                  | 删除一组键值对                             |
| Range(f func(key, value interface{}) bool) | 遍历出键和值                               |

代码示例：

```
package main

import (
	"fmt"
	"sync"
)

var wg sync.WaitGroup

// 初始化 sync.map
var shine = sync.Map{}

func main() {
	wg.Add(1)

	go func() {
		defer wg.Done()
		for i := 0; i < 3; i++ {
			shine.Store(i, i)
		}
	}()

	wg.Wait()
	shine.Range(func(k, v interface{}) bool {
		fmt.Printf("key : %#v, value : %#v\n", k, v)
		return true
	})
}

// key : 0, value : 0
// key : 1, value : 1
// key : 2, value : 2
```

# 其他功能

sync 包的其他功能可参照官方文档：https://pkg.go.dev/sync
