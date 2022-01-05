# for循环

在 Golang 中 for 循环具有局部作用域，所以迭代变量只能在 for 循环中使用，for 循环基本语法如下：

```
for 迭代变量 := 初始值; 循环条件; 迭代变量操作{
	代码逻辑...
}
```

当循环条件为 true 时，for 循环将一直执行：

```
package main

import "fmt"

func main() {
	for i := 0; i < 3; i++ {
		fmt.Printf("No.%d\n", i+1)
	}
}

// No.1
// No.2
// No.3
```



# 循环变体

for 循环可以省略迭代变量的书写，但是迭代变量的操作语句必须要写，使用分号对迭代变量进行占位：

```
package main

import "fmt"

func main() {
	var i int = 0
	for ; i < 3; i++ {
		fmt.Printf("No.%d\n", i+1)
	}
}

// No.1
// No.2
// No.3
```

for 循环也可以省略迭代变量以及后面操作语句的书写，这与其他语言中的 while 循环效果等同：

```
package main

import "fmt"

func main() {
	var i int = 0
	for i < 3 {
		fmt.Printf("No.%d\n", i+1)
		i += 1
	}
}

// No.1
// No.2
// No.3
```



# 无限循环

for 定义无限循环的语法格式如下：

```
for {
	代码逻辑...
}
```

在无限循环中，可通过循环控制语句或者 panic  语句来退出无限循环。





# 字符串遍历

for 循环遍历字符串时，只能得到 byte，所以推荐使用 for/range 遍历：

```
package main

import "fmt"

func main() {
	var str string = "苟浪"
	for i := 0; i < len(str); i++ {
		fmt.Printf("%v(%c)", str[i], str[i])
	}
}

// 232(è)139()159()181(µ)170(ª)
```



# 切片遍历

for 循环遍历切片时，可得到切片的索引，根据索引取值即可：

```
package main

import "fmt"

func main() {
	var sle = []string{"A", "B", "C"}
	for i := 0; i < len(sle); i++ {
		value := sle[i]
		fmt.Printf("index:(%d) value:(%s)\n", i, value)
	}
}

// index:(0) value:(A)
// index:(1) value:(B)
// index:(2) value:(C)
```

数组同理，不再进行例举。



# 映射遍历

当映射中的键为 int 类型时，for 循环也可以遍历映射：

```
package main

import "fmt"

func main() {
	var shine = map[int]string{1: "A", 2: "B", 3: "C"}
	for i := 0; i < len(shine); i++ {
		fmt.Printf("key:(%d) value:(%s)\n", i+1, shine[i+1])
	}
}

// key:(1) value:(A)
// key:(2) value:(B)
// key:(3) value:(C)
```

但将 int 类型作为映射键很少使用，所以利用 for 循环遍历映射如同鸡肋，正确的做法应当是使用 for/range 。