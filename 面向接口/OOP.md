# 面向对象

Golang 虽然说是一门面向接口的编程语言，但它也可以实现面向对象的三大功能，而面向对象三大功能分别为：

- 封装
- 继承
- 多态

编程范式本身并无优劣之分，不同的编程范式可适用于不同的场景，因此不必比较二者之间孰优孰劣。

# 封装

面向对象编程范式中的封装在 Golang 中是能够完美体现的。

Golang 可以通过不同风格的命名标识来区分该资源的可见性：

- 大驼峰式命名风格：对外公布
- 小驼峰式命名风格：对外隐藏

此外，Golang 中的结构体也是封装的体现，将一系列拥有共同特征的事物组合在一起，方便后期进行使用。

# 继承

Golang 支持结构体嵌套，外部的结构体可以调用内部结构体的任意方法，这就是继承的体现（或者将它形容为组合会更加贴切）。

并且 Golang 对于匿名嵌套的结构体来说，还支持方法覆写。

下面的代码示例中定义了狗和狼 2 种结构体，狗继承于狼，但是覆写了狼嚎叫的方法：

```
package main

import "fmt"

// 定义狼的接口
type WolfInterface interface {
	Call() // 狼会嚎叫
}

// 定义狗的接口
type DogInterface interface {
	WolfInterface
	Tail() // 狗会摇尾巴
}

// 定义狼的结构体
type Wolf struct {
	name string
}

func (w *Wolf) Call() {
	fmt.Printf("%s calling ! aowu~ aowu~ aowu~\n", w.name)
}

// 定义狗的结构体
type Dog struct {
	Wolf
}

func (d *Dog) Tail() {
	fmt.Printf("%s tail\n", d.name)
}

// 方法覆写
func (d *Dog) Call() {
	fmt.Printf("%s calling ! wang~ wang~ wang~\n", d.name)
}

func main() {
	// 定义狗的接口变量
	var dog DogInterface
	// 将 Dog 初始化后的结构体指针赋值给 dog
	dog = &Dog{
		Wolf: Wolf{
			name: "Kevin",
		},
	}

	// 如果 Dog.Call 存在，就调用 Dog.Call
	// 否则调用 Wolf.Call
	dog.Tail()
	dog.Call()
}
```

# 多态

Golang 多态的体现在于接口的嵌套，一个主接口可以衍生出无数的子接口，但是每个子接口又拥有一些不同的地方。

这里不再具体演示。
