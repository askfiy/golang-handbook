# go 1.8

## 泛型支持

go 1.8 终于支持了万众期待的泛型，在编码中可使用 any 关键字代替 interface{} 空接口。

该特性整体来说让 Golang 更易于使用，但是编译速度会有一定的下降。

代码示例：

```
package main

import "fmt"

func anyExample(x any) {
	fmt.Printf("%T\n", x)
}


func interfaceExample(x interface{}) {
	fmt.Printf("%T\n", x)
}

func main() {
	// identical
	anyExample([]int{1, 2, 3})
	anyExample("hello world")

	interfaceExample([]int{1, 2, 3})
	interfaceExample("hello world")
}

// []int
// string
// []int
// string
```
