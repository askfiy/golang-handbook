# switch/case

switch/case 是一种结构更加清晰的流程控制语句。

- 当满足任何一个 case 条件后，该 case 下的分支代码块将被执行，而剩余的 case 和 default 分支条件将不再会继续判定
- 当任何一个 case 条件都不满足时，将会执行 default 下的分支代码块

Golang 中的 switch/case 和其他语言中的略有不同：

- Golang 不需要在每个 case 分支代码块中书写 break，它会自动进行书写
- Golang 不需要在 defualt 分支代码块中书写 break，它会自动进行书写
- Golang 新增 fallthrough 穿透功能，可以一次执行多个 case 代码块



# 多条件判定

switch/case 的多条件判定相当于 if/else if/else，只不过逻辑更清晰，书写更简单。

语法格式：

```
switch {
case 条件:
	代码逻辑...
case 条件:
	代码逻辑...
default:
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
	switch {
	case userAge < 18:
		fmt.Printf("juvenile\n")
	case userAge < 30:
		fmt.Printf("youth\n")
	case userAge < 60:
		fmt.Printf("middle aged\n")
	case userAge < 80:
		fmt.Printf("elderly\n")
	default:
		fmt.Printf("can still meal\n")
	}
}
```





# 定值判定

switch/case 的定值判定在针对不同选项的值进行不同逻辑处理时很常用。

语法格式：

```
switch 变量/常量 {
case 值:
	代码逻辑...
case 值:
	代码逻辑...
default:
	代码逻辑...
}
```

代码示例：

```
package main

import (
	"fmt"
	"strings"
)

func main() {
	var userName string
	fmt.Printf("please input your user name :\n>>>")
	fmt.Scanf("%s", &userName)
	switch strings.ToLower(userName) {
	case "jack":
		fmt.Printf("welcome home %s!\n", userName)
	case "tom":
		fmt.Printf("welcome home %s!\n", userName)
	default:
		fmt.Printf("who are you?\n")
	}
}
```





# 使用或语法

在定值判定中，如果想让多个值公用一个代码块，可使用逗号对 case 值进行分割。

语法格式：

```

switch 变量/常量 {
case 值, 值:
	代码逻辑...
case 值, 值:
	代码逻辑...
default:
	代码逻辑...
}
```

代码示例：

```
package main

import (
	"fmt"
	"strings"
)

func main() {
	var userName string
	fmt.Printf("please input your user name :\n>>>")
	fmt.Scanf("%s", &userName)
	switch strings.ToLower(userName) {
	case "jack", "tom":
		fmt.Printf("welcome home %s!\n", userName)
	default:
		fmt.Printf("who are you?\n")
	}
}
```



# fallthrough

fallthrough 关键字可以在当前 case 分支代码块执行完成后继续执行下一个 case 分支代码块，无论下一个 case 的条件是否为 true。

该关键字解决了 Golang 省略 case 中 break 书写后所导致的 case 无法穿透问题 。

一个简单的应用场景，下面有 3 种日志级别：

- ERROR 级别日志会记录到 ERROR、WARNING、INFO 这 3 个日志文件中
- WARNING 级别日志会记录到 WARNING、INFO 这 2 个日志文件中
- INFO 级别日志只会记录到 INFO 这 1 个日志文件中

代码示例：

```
package main

import (
	"fmt"
	"strings"
	"time"
)

func main() {
	var logLevel string = "ERROR"
	var logMessage string = "runing error"
	var logTime string = time.Now().Format("2006-1-2 15:4:5")
	var logLine string = fmt.Sprintf("[%s] [%s] : %s", logLevel, logTime, logMessage)

	fmt.Printf("%s\n", logLine)
	switch strings.ToLower(logLevel) {
	case "error":
		fmt.Printf("write to error log file ...\n")
		fallthrough
	case "warning":
		fmt.Printf("write to warning log file ...\n")
		fallthrough
	case "info":
		fmt.Printf("write to info log file ...\n")
	default:
		fmt.Printf("log level failed\n")
	}
}
```



# 作用域变量

Golang 中的 switch/case 语句拥有块级作用域。

在 case 条件判定执行之前，可以定义一些作用域变量（只能使用短变量声明）。

语法格式：

```
switch 变量名 := 值 {
case 条件:
	代码逻辑...
case 条件:
	代码逻辑...
default:
	代码逻辑...
}
```

代码示例，下面声明的变量 name 只能在当前的 if 代码块中使用，否则将会出现编译错误的情况：

```
package main

import "fmt"

func main() {
	switch name := "Jack"; {
	case name == "Jack":
		fmt.Printf("name is Jack\n")
	case name == "Tom":
		fmt.Printf("name not is Jack\n")
	default:
		fmt.Printf("who are you?\n")
	}
}
```
