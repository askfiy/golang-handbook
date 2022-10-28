# GO MODULES

## 基本介绍

在早期时候，Golang 采用 GOPATH 模式来管理项目下所有的依赖包，但是由于种种原因 GOPATH 管理模式被废弃了。

现如今，Golang 使用 GOMOD 模式来管理项目依赖包，它类似于 Node.js 的 NPM 包管理器，使用非常方便。

## 开启 GOMOD

若要开启 GOMOD，请确保 Golang 版本大于 1.11。

Linux 或 Mac 平台在环境变量配置中加入以下 2 行配置：

```
export GO111MODULE=on
export GOPROXY="https://proxy.golang.org,direct"
```

如果是 Windows 平台，则在终端执行以下命令：

```
set GO111MODULE=on
set GOPROXY="https://proxy.golang.org,direct"
```

GO111MODULE 意为是否开启 GOMOD 支持，它有 3 个选项：

- off：不开启
- on：开启
- auto：默认值，特定情况下开启

GOPROXY 意为从哪里下载 Golang 依赖包，默认是国外源，这里修改为国内源。

# 常用命令

## 命令一览

以下是 GOMOD 模式中会经常使用的命令：

| 命令            | 描述                             |
| --------------- | -------------------------------- |
| go mod init     | 初始化当前目录，创建 go.mod 文件 |
| go mod edit     | 编辑 go.mod 文件                 |
| go mod download | 下载依赖包到本地                 |
| go mod graph    | 打印当前项目模块依赖图           |
| go mod tidy     | 增加缺少的包、移除无用的包       |
| go mod vendor   | 将依赖赋值到 vendor 目录下       |
| go mod verify   | 校验依赖                         |
| go mod why      | 解释为什么需要依赖               |

## 创建项目

接下来通过 GOMOD 创建 1 个 Go 项目：

```
$ mkdir ./demo       // 新建项目根目录
$ cd ./demo          // 进入项目根目录
$ go mod init demo   // 生成 go mod 文件并指定项目名称
```

执行完成后，项目根目录下会生成一个 go.mod 文件，打开该文件内容如下：

```
// 项目名称
module demo

// Golang 版本
go 1.17
```

创建一个 main.go 并导入第三方包 uuid ：

```
package main

import (
	"fmt"
	"github.com/google/uuid"
)

func main() {
	fmt.Printf("%#v\n", uuid.New())
}
```

## 下载依赖

通过 go get 命令可下载依赖包：

- go get -u：升级依赖包到次要版本或修订版本
- go get -u=patch：升级依赖包到最新修订版本
- go get package@version：升级依赖包到指定版本

上述例子中使用了第三方包 uuid ，通过 go get -u 命令下载：

```
$ go get -u

go: downloading github.com/google/uuid v1.3.0
go get: added github.com/google/uuid v1.3.0
```

下载完成后，当前根目录下会出现一个 go.sum 文件来记录依赖树：

```
github.com/google/uuid v1.3.0 h1:t6JiXgmwXMjEs8VusXIJk2BXHsn+wx8BZdTaoZ5fu7I=
github.com/google/uuid v1.3.0/go.mod h1:TIyPZe4MgqvfeYDBFedMoGGpEw/LqOeaOT+nhxU+yHo
```

同时，go.mod 文件也会进行更新：

```
module demo

go 1.17

require github.com/google/uuid v1.3.0
```

若想将下载的第三方包包移动到当前项目下，可使用 go mod vendor 命令，它将在当前项目根目录下创建一个 vendor 目录，并将第三方包存放过来。

当项目中不再需要使用某个第三方包时，可以运行 go mod tidy 命令移除它。

## 替换包源

go.mod 文件提供了 4 种配置项：

- module 语句指定包的名字（路径）
- require 语句指定的依赖项模块
- replace 语句可以替换依赖项模块
- exclude 语句可以忽略依赖项模块

replace 最为常用，当某些包在国内访问 golang.org/ 失效时，可将其替换为 github 上对应的包：

```
replace (
	golang.org/x/crypto v0.0.0-20180820150726-614d502a4dac => github.com/golang/crypto v0.0.0-20180820150726-614d502a4dac
	golang.org/x/net v0.0.0-20180821023952-922f4815f713 => github.com/golang/net v0.0.0-20180826012351-8a410e7b638d
	golang.org/x/text v0.3.0 => github.com/golang/text v0.3.0
)
```

# 本地导入包

## 导入当前项目下的包

目录结构如下，package1 位于 project 中，并且没有 go.mod 文件：

```
project
├── go.mod
├── main.go
└── package1
    └── pkg1.go
```

package1 包的代码如下：

```
package package1

var Help = `
	this is package1 ...
`
```

在 project 中导入 package1 包：

```
package main

import (
	"fmt"
    // 当前项目名称(go mod 中 module 配置项) + 包名
	pkg1 "project/package1"
)

func main() {
	fmt.Printf("%s\n", pkg1.Help)
}
```

## 导入另一个项目的包

目录结构如下，2 个项目都有自己的 go.mod 文件，并且是同级关系：

```
.
├── project1
│   ├── go.mod
│   └── main.go
└── project2
    ├── go.mod
    └── main.go
```

如果想在 project1 中导入 project2，首先需要在 project1 的 go.mod 文件里指定 project2 的路径：

```
module project1

go 1.17

require "project2" v0.0.0
replace "project2" => "../project2"
```

然后在 project1 中导入 project2 中的包：

```
package main

import (
	"fmt"
	"project2"
)

func main() {
	fmt.Printf(project2.Help)
}
```

project2 的 main 文件代码如下：

```
package project2

var Help = `
	this is project2 ...
`
```
