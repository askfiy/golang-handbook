# for/range

Golang 中提供了 for/range 语法来更加方便的遍历数组、切片、字符串、映射以及通道。

- 遍历字符串：可得到 byte 单位的 index 和 rune 单位的 character
- 遍历切片 / 数组：可得到 index 和 value
- 遍历映射：可得到 key 和 value

# 字符串遍历

使用 for/range 遍历字符串：

```
package main

import "fmt"

func main() {
	var str string = "苟浪"
	for _, character := range str {
		fmt.Printf("(%c)\n", character)
	}
}

// (苟)
// (浪)
```

# 切片遍历

使用 for/range 遍历切片：

```
package main

import "fmt"

func main() {
	var sle = []string{"A", "B", "C"}
	for index, value := range sle {
		fmt.Printf("index:(%d) value:(%s)\n", index, value)
	}
}

// index:(0) value:(A)
// index:(1) value:(B)
// index:(2) value:(C)
```

数组同理，不再进行例举。

# 映射遍历

使用 for/range 遍历映射：

使用 1 个迭代变量只能拿到 key：

```
package main

import "fmt"

func main() {
	var shine = map[string]string{
		"key1": "value1",
		"key2": "value2",
		"key3": "value3",
	}
	for key := range shine {
		value := shine[key]
		fmt.Printf("key:(%s) value(%s)\n", key, value)
	}
}

// key:(key1) value(value1)
// key:(key2) value(value2)
// key:(key3) value(value3)
```

使用 2 个迭代变量可以同时拿到 key 和 value：

```
package main

import "fmt"

func main() {
	var shine = map[string]string{
		"key1": "value1",
		"key2": "value2",
		"key3": "value3",
	}
	for key, value := range shine {
		fmt.Printf("key:(%s) value(%s)\n", key, value)
	}
}

// key:(key1) value(value1)
// key:(key2) value(value2)
// key:(key3) value(value3)
```
