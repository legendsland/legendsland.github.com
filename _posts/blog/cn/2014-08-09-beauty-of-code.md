---
layout: post
title: 代码之美
description: 
categories: [blog,cn]
---

举三个例子说明代码中可能存在的美，其中两个来自《代码之美》这本书的第一章和最后一章，第三个例子来自 C++ 之父的一次技术讲座。

##1. 正则表达式匹配程序

原文中的需求是写一个精简的正则表达式匹配程序，要求能够匹配：

{% highlight sh %}
c 任意字幕
. 任意单个字符
^ 字符串开头
$ 字符串结尾
* 零个或者多个前一个字符
{% endhighlight %}

{% highlight c %}
/* match: search for regexp anywhere in text */
int match(char *regexp, char *text)
{
  if (regexp[0] == '^')
    return matchhere(regexp+1, text);
  do { /* must look even if string is empty */
    if (matchhere(regexp, text))
      return 1;
  } while (*text++ != '\0');
  return 0;
}

/* matchhere: search for regexp at beginning of text */
int matchhere(char *regexp, char *text)
{
  if (regexp[0] == '\0')
    return 1;
  if (regexp[1] == '*')
    return matchstar(regexp[0], regexp+2, text);
  if (regexp[0] == '$' && regexp[1] == '\0')
    return *text == '\0';
  if (*text!='\0' && (regexp[0]=='.' || regexp[0]==*text))
    return matchhere(regexp+1, text+1);
  return 0;
}

/* matchstar: search for c*regexp at beginning of text */
int matchstar(int c, char *regexp, char *text)
{
  do { /* * matches zero or more instances */
    if (matchhere(regexp, text))
      return 1;
  } while (*text != '\0' && (*text++ == c || c == '.'));
  return 0;
}
{% endhighlight c %}

递归作为编程语言的基础与核心，这段简短精致的代码，清晰地证明如下事实：对正则表达式这种语言，如何用递归的语言表达出来。就像将你熟知的自动机转换成为递归表达式。

这似乎是让程序回归到了其本源：任何程序都能以递归的方式表达出来。迷人的地方并不在于递归代码的简洁，而是你找到了问题的递归形式。这种美感是牛顿式的美感，当你使用函数式程序语言，当你使用动态规划算法，当给你去分而治之的时候，这种自相似的和谐美感能让你兴奋地（很可能误）认为发现了宇宙万物的真理。

如果你读过《哥德尔，巴赫，费舍尔》就知道我在说什么。

将问题分解的方法，从实践的角度而言，并不需要一定转化为递归式，将其分解为可靠的、结构良好的、已经解决的标准子问题，或许更有价值。Bjarne Stroustrup 的一次 C++ 技术讲座 加强了我的这种看法。


##2. 将代码重构为算法

Bjarne Stroupstrup 举了这样一个真实的例子，怎样重构下面的代码：

{% highlight c %}
void drag_item_to(Vector& v, Vector::iterator source, Coordinate p)
{
  // find the insertion point
  Vector::iterator dest = find_if(v.begin(), v.end(), contains(p));

  if (source < dest)
    rotate(source, source+1, dest); // from before insertion point
  else
    rotate(dest, source, source+1); // from after insertion point
}
{% endhighlight %}

即使你很熟悉 rotate ，第一眼你不会想到这几行代码是作什么用。它是 vector 内部的移动操作，将 source 插到 dest 之前。数据类型和判断都是针对特定问题的。如果将它重构成泛型，这些特定的类型会被泛化，更重要的这个操作会将以基本、正交的操作表达出来，而不是各种条件判断和循环。这好比提取特征向量。

重构的代码如下：

{% highlight cpp %}
template < typename Iter, typename Predicate>
pair<Iter, Iter> gather(Iter first, Iter last, Iter p, Predicate pred)
  // move elements for which pred() is true to the insertion point p
{
  return make_pair(
      stable_partition(first, p, !bind(pred, _1)),  // from before insertion point
      stable_partition(p, last, bind(pred, _1))     // from after insertion point
  );
}
{% endhighlight %}

在线性随机访问空间 [i, j) 上将满足条件 p 的元素插入到位置 k：insert(i,j,k,p)，等价于将 [i, j) 分成 [i, k) 和 [k, j) 两个空间，分别用条件 !p 和 p 进行 partition 操作：

insert(i, j, k, p) = partition(i, k, !p) ∪ partition(k, j, p)

很明显，partition 更本质，也更通用，更重要的是它用（重复的）自己定义了 insert，insert 被分解成为两个相同结构的子问题，这个分解像不像是发现问题的递归子结构？！将 insert 以 partition 的方式表达出来是不是显得更接近问题的实质，而且还更漂亮，更少的代码和 bug。C++ (STL) 将这种“子结构”平台搭建好，但需要 paradigm shift，才能发现其中之美。实践意义上，泛化就像设计模式一样，除了提供的技巧之外，更重要的是指明了重构的目标：将代码用标准算法组装出来。

##3. 判断三点是否共线的程序

判断三点是否共线，看起来是很简单的问题 —— 你应该看看那本书，事情并没有你看起来这么简单，比如使用斜率的话，你要考虑垂直的特殊情况；如果用三角形两边和大于第三边，会涉及到开方运算，无理数精度有限会导致问题。最后，作者找到了完美的判断方法：计算三角形的面积，如果为零，则三点共线。当作者给出最后完美的程序时，你只能叹服：

{% highlight lisp %}
(defun area-collinear (px py qx qy rx ry)
 (= (* (- px rx) (- qy ry))
 (* (- qx rx) (- py ry))))
{% endhighlight %}

它基于计算面积的矢量公式。

作者说存在传说中的一本书，里面记录了最完美的数学证明，而他试图寻找这种能记录在类似书中的代码。无独与偶，顽固地认为存在这种书的并不只这篇文章的作者，大名鼎鼎的 Knuth 在他的 literate programming 中写到：

> 我强烈地爱上了这套新方法，对过去写的每一个程序，我都抑制不住地想将它们“文艺”化。我发现自己忍不住去编那些布置给学生助教们的作业程序，为何？因为对我而言，我最终写出了那些程序，这就是它们本该被写成的样子。新方法促使我写出比以往更可读、也更好的程序。

对他们，对那些执着地寻找最完美的代码的程序员们，在另一种语言，另一空间，有大师福楼拜遥相呼应：

> 不论一个作家所要描写的东西是什么，只有一个名词可供他使用，只有一个动词能使对象生动，只有一个形容词能使对象的性质鲜明。因此就得用心去寻找，直至找到那一个名词、那一个动词和那一个形容词。

他们深刻理解到符号系统最具价值的地方在其精确，这种极致追求劈开了普通人与真正的大师之间难以逾越的鸿沟，这是“差不多就可以”与“完全无法企及”之间的光年距离。这种美就像你初次遇见完全对的人：此生不再作它想。

##总结

毫无疑问，上述例子证明了代码的美感是存在的，但这种美，就像欣赏任何其他严肃的艺术作品一样，需要你理智上的能力和付出，而不仅仅是直观上的感受。更私人的看法就是，程序是最接近巴赫音乐的艺术。它们都是在形式上试图去挑战难以企及的内容，前者用符号接近人的理性，而后者用另一种符号向神祈祷倾诉。

简言之，在我看来，代码之美存在于简洁优雅的数学真理和自我递归的完美重复中。而这一切，大自然早已知道，并以各种令人惊狂的方式藏在一滴水、或者一片树叶当中。




