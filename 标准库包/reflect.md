# 获取类型

reflect.TypeOf(v)



# 获取种类

reflect.TypeOf(v).Kind





# 调用函数

```

v.Call(
	[]reflect.Value{
		reflect.Value(参数),
		reflect.Value(参数),
	}
)
```



# 判断一个函数是否有返回值

```
reflect.ValueOf(
    v.Call(
        []reflect.Value{
            reflect.Value(参数),
            reflect.Value(参数),
        }
    )
).IsNil()
```

