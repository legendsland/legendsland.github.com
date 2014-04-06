---
layout: post
title: Y Combinator （Part 2 重构）
description: （没有“实用价值”的）函数式重构
category: blog
---


其实应该叫“魔术”更好点。重构的目标是让代码的结构可能性更好，但这里谈到了重构，只是纯粹形式上的变换，目的是为了让你“惊奇”。当然不止于此，这系列是 Y combinator 的文章，自然和它有关系，下一篇你就会知道。

一个返回带初值加法器的函数：

~~~~~ clojure
(define (make-adder x)
 (lambda (n)
  (+ x n))
)

((make-adder 10) 1)  ;表示用初值10的加法器加1.
~~~~~


##用 lambda 包裹

对 make-adder 的函数体，可以用一层无参数 lambda 包裹一下，为了保持语义不便，这层 lambda 需要运算一遍：

~~~~~ clojure
(define (make-adder-a x)
((lambda ()
 (lambda (n)
   (+ x n))))

((make-adder-a 10) 1)  ;;11
~~~~~


##绑定参数
    
在1的基础上，给这个新的 lambda 增加参数，保证参数名与里层 lambda 中的变量名字不一样：

~~~~~ clojure
(define (make-adder-b x)
((lambda (bring-in-anything)
 (lambda (n)
   (+ x n))
apply-anything-either)
)
((make-adder-b 10) 1)  ;;11
~~~~~

##用lambda封装
    
和以上两种做法非常类似，但很不同。用 lambda 封装一次，和包裹的区别在于，封装保证了原 lambda 的接口不变，而包裹改变了里面 lambda 的接口（lambda 表达式变成了application）：

~~~~~ clojure
(define (make-adder-c x)
(lambda (m)
 ((lambda (n)
   (+ x n))
 m)
)
((make-adder-c 10) 1)  ;;11
~~~~~

应用到新 lambda 的任何参数都会原封不动地传递给里面的 lambda。这更类似于C语言里面的函数封装。

##Inline

这个相当于用 lambda 替换引用的函数名：

~~~~~ clojure
((make-adder 10) 1)
~~~~~

写成：

~~~~~ clojure
(((lambda (x)
    (lambda (n)
     (+ x n))) 10) 1)
~~~~~


##Delay
  
在 SICP 第三章里面，有专门讲到惰性计算，使用的就是将原先需要立即计算的表达式延迟了。这会改变原来的语义，不能说是“重构”，但这是很重要的一个技巧，后面也有用到：

~~~~~ clojure
(define (make-adder-d x)
 (lambda ()
   (make-adder x)
 )
)
(((make-adder-d 10)) 1)  ;;11, 注意多了一层括号
~~~~~

从编程的角度来看，这些替换不能说让代码更好，只是为了满足某些特定的意义，比如1和2一般是为了将 lambda 内部的“东西” 提取出来作为参数（这可以叫重构吧），inline 是为了合并函数，delay 为了延迟计算，至于为什么延迟，则是另一个话题了，此处不按。

