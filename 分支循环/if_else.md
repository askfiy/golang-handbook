# if

多条 if 语句同级排列时会逐行进行判断，若 if 条件为 true 则执行其下的分支代码块，若 if 条件为 false 则略过：

语法格式：

```
if 条件 {
	代码逻辑...
}
if 条件 {
	代码逻辑...
}
```

代码示例：

```
package main

import "fmt"

func main() {
	var userAge uint8
	fmt.Printf("please enter your age :\n>>> ")
	_, err := fmt.Scanf("%d", &userAge)
	if err != nil {
		fmt.Printf("your input failed! age must is digital\n")
		return
	}
	if userAge < 18 {
		fmt.Printf("juvenile\n")
	}
	if userAge >= 18 && userAge < 30 {
		fmt.Printf("youth\n")
	}
	if userAge >= 30 && userAge < 60 {
		fmt.Printf("middle aged\n")
	}
	if userAge >= 60 && userAge < 80 {
		fmt.Printf("elderly\n")
	}
	if userAge >= 80 {
		fmt.Printf("can still meal\n")
	}
}
```



# if/else

if 代表如果怎样，else 代表否则怎样。

一组 if/else 只会执行其中的一个分支代码块。

语法格式：

```
if 条件 {
	代码逻辑...
} else {
	代码逻辑...
}
```

代码示例：

```
package main

import (
	"fmt"
	"strconv"
)

func main() {
	var userInput string
	fmt.Printf("enter any character, determine if it is a numeric string :\n>>> ")
	fmt.Scanf("%s", &userInput)
	_, err := strconv.ParseFloat(userInput, 64)
	if err != nil {
		fmt.Printf("user input is not a digital string")
	} else {
		fmt.Printf("user input is a digital string")
	}
}
```



# else if

多条 if 会按顺序依次执行对每一条 if 语句都进行判定。这会浪费大量的时间。

而如果使用 else if 则只会从多条逻辑判定中取出第一个 if 条件为 true 的分支代码块进行执行，后续的判定将不再继续。

也就是说，if/else if/else 三者只会执行其中某一个分支。

语法格式：

```
if 条件 {
	代码逻辑...
} else if 条件 {
	代码逻辑...
} else {
	代码逻辑...
}
```

代码示例：

```
package main

import "fmt"

func main() {
	var userAge uint8
	fmt.Printf("please enter your age :\n>>> ")
	_, err := fmt.Scanf("%d", &userAge)
	if err != nil {
		fmt.Printf("your input failed! age must is digital\n")
		return
	}
	if userAge < 18 {
		fmt.Printf("juvenile\n")
	} else if userAge < 30 {
		fmt.Printf("youth\n")
	} else if userAge < 60 {
		fmt.Printf("middle aged\n")
	} else if userAge < 80 {
		fmt.Printf("elderly\n")
	} else {
		fmt.Printf("can still meal\n")
	}
}
```

# 作用域变量

Golang 中的 if 语句拥有块级作用域。

在 if 判定执行之前，可以定义一些作用域变量（只能使用短变量声明）。

语法格式：

```
if 变量名 := 变量值; 条件 {
	代码逻辑...
}
```

代码示例，下面声明的变量 name 只能在当前的 if 代码块中使用，否则将会出现编译错误的情况：

```
package main

import "fmt"

func main() {
	if name := "Jack"; name == "Jack" {
		fmt.Printf("name is Jack\n")
	} else {
		fmt.Printf("name not is Jack\n")
	}
}
```
