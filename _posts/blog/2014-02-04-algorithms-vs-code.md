---
layout: post
title: 算法 vs. 代码
description: 写代码，还是应该写算法？
category: blog
---

_Inspired by Bjarne Stroustrup[^1]._

## qsort

所有的算法都可以写成代码，但代码就不一定是（狭义上的）算法。大多数人在写代码，而不是算法。它们一个最大区别在于，算法尝试解决一类通用的问题，而代码处理特定的问题。比如 C++ 的 STL 是算法的集合，实现最基本的数据结构以及在其上的通用操作，而某段快排的代码只能满足特定的数据，当然你会反驳说 C 标准库里面的 qsort 就是万能的：

{% highlight c %}
void qsort(void *base, size_t nmemb, size_t size, int(*compar)(const void*, const void*));
{% endhighlight %}

对。它的万能取决于 C 语言中的 void* ，因为它能代表任意类型。但问题是，当你使用这种“灵活”的类型时，每次都需要自己手工对其“具体化”，你要明确它的实际大小（size），当使用指针操作的时候，每次都需要带上这个 size，比如当你计算第 10 个（从 0 开始）元素的时候：

```c
base + size*10
```

但如果 base 类型是具体的，比如 int*，这时就只需要写成：

```c
base + 10
```

但正是因为这种所谓的灵活，代价就是需要程序员人肉编码，而且极大增加了错误的可能。因为稍不注意就会忘记了计算地址需要带上 size。

灵活的 void* 导致需要传递额外的参数： nmemb 和 size。对具体的类型，比如含 10 个整数的数组 int[10]，它的 nmemb 能够通过 sizeof(int[10])/sizeof(int) 计算出来，单个元素的 size 就是 sizeof(int)。而这一切信息，当面对虚空 void* 时，被吞噬得一干二净：

```c
#define LENGTH(array) (sizeof(array)/sizeof(array[0]))
#define ELEM_SIZE(array) (sizeof(array[0]))

typedef int(*cmp)(const void*, const void*);  // qsort 需要的参数类型

int a[] = {2, 4, 13, 8, 1, 12, 7, 9, 10, 4};

qsort(a, LENGTH(a), ELEM_SIZE(a), (cmp)compar_int);
```


“噩梦”还没有结束。qsort 的最后一个参数是函数指针，在 qsort 函数体里面，会使用 (*comapr)(...) 来比较大小。而这样的间接调用方式比起直接额函数调用是低效的。另外，当你实现 compar 的具体类型，比如：

```c
static int compar_int(const void* p1, const void* p2) {
  if( *(const int*)p1 > *(const p2*)b )
    return 1;
  else if( *(const int*)p1 == *(const int*)p2 )
    return 0;
  else
    return -1;
}
```

在 compare_int 函数体里面，p1 又会被转成 const int* ，而这难道不是废话吗？一切都是因为试图在 C 中为了实现“通用”的功能，和 void* 签下的魔鬼契约。

qsort 是高效的算法，基本想法是首先将待排序的数据分成了“大致”有序的两组，然后在分别“大致”地给这两组排序，这样的“大致有序”的过程一直下去，最后就成了完全有序的数据。这和我们人整理物件有相似的道理，开始杂乱无章的时候，你最好不要从小处、从细处开始整理，因为当整体杂乱时，细处的整理可能会重复很多遍，这是低效的。而首先要将物件大致归类，这样每类的总量变少，再对其分别整理。

你很难说这是人类的智慧，还是“世界的规律本来如此”。

qsort 先将数据划分成两部分：[first, middle) 和 (middle, last)。[first, middle) 里面的任何数据比 (middle, last] 里面的所有数据都小。这两区间之一有可能不存在，取决于数据的性质和 middle 的选择。接着对这两部分使用同样的方法继续划分，直到最后只有 0 或者 1 个元素的区间，这时排序结束：

```c
void
qsort(void *base, size_t nmemb, size_t size, int(*compar)(const void *, const void *)) {

  /* 结束条件 */
  if( nmemb <= 1 )
    return; 

  /* [first, middle) 区间的最后一个元素的地址  */
  void* small_end = base - size; 

  /* 将 last-1 设置为 middle  */
  void* middle = base + size*(nmemb-1); 
  void* current;

  /* 遍历 [base, last-1) */
  for(current=base; current<middle; current+=size) {
    if( (*compar)( current, middle ) ) {
      small_end += size;
      SWAP( small_end, current, size );
    }
  }

  /* 将 middle 换到 [first, middle) 之后 */
  SWAP( middle, small_end+size, size );

  /* 更新 middle 指针 */
  middle = small_end+size;

  /* qsort 子区间 */
  qsort(base, (middle-base)/size, size, compar);
  qsort(middle+size, nmemb-(middle-base)/size-1, size, compar);
}

```

在 qsort 里面，它需要 swap 数据，使用了 bitwise 的机制（因为 void* 不带任何类型信息，只能是按字节去做最低级的拷贝操作）：

```c
#define SWAP(a, b, size) {\
   register size_t __size = (size);\
   register char *__a = (a), *__b = (b);\
   do {\
     char __tmp = *__a;\
     *__a++ = *__b;\
     *__b++ = __tmp;\
   } while (--__size > 0);\
}
```

void* 消灭了一切，你想做任何与特性类型的定制，无疑，是不可能的。C 本来就弱的类型系统被完全抛弃了，直接回到了汇编（mov）的世界。

## C++ 泛型接口

C++ 的泛型系统就是系统地针对上述问题，尝试既能编写通用的代码，又不必摧毁类型。当你无须关心类型上的细节，直接处理问题本身，比如对 qsort 而言，考虑的是如何遍历，如何分而治之，你编制出来的就是算法本身，而不是混杂了许多无关算法的语言细节。这样的代码看起来就像是算法教材上完美的伪码一样。


```cpp
template<typename _RandomAccessIterator>
  inline void
  sort(_RandomAccessIterator __first, _RandomAccessIterator __last);

template<typename _RandomAccessIterator, typename _Compare>
  inline void
  sort(_RandomAccessIterator __first, _RandomAccessIterator __last, _Compare __comp);
```

就上面的接口而言，C++ 让类型系统变得更加安全和通用，采用了以下几种技术：

1. 使用模板参数泛化里类型，但仍然是类型安全的，在编译的时候会进行类型检查。
2. 使用统一区间 [first, last) 表示数据的处理范围。
3. 对原始的 C 数据类型，提供了带比较函数的接口，这点通过函数重载做到。
4. 通过 traits 能够自动获得元素的数据类型。

基本上，将上面 qsort 稍微修改一下便能使他接受标准的 STL 迭代类型 —— 即定义良好的任意的类型。

```c
template<typename _RandomAccessIterator, typename _Compare>
  inline void
  my_sort(_RandomAccessIterator __first, _RandomAccessIterator __last, _Compare __comp) {

    if( __last - __first <= 1 ) 
      return;

    _RandomAccessIterator small_end = __first - 1;
    _RandomAccessIterator middle = __last - 1;
    _RandomAccessIterator current;

    for(current=__first; current<middle; current++) {
      if( __comp( *current, *middle) ) {
        small_end++;
        std::swap( *small_end, *current );
      }
    }

    std::swap( *middle, *(small_end + 1 ));

    middle = small_end + 1;

    my_sort(__first, middle, __comp);
    my_sort(middle+1, __last, __comp);
 }

  /* __comp 的接口定义与 C 里面 qosrt 的不一样, C 要求返回 -1, 0, 1 */
  bool less_int(int a, int b) {
    if( a < b )
      return true;
    else
      return false;
  }

  int b[] = {1, 4, 32, 9, 12, 7, 11};
  generic_qsort(b, b+7, less_int);

  double d[] = {1.0, 5.23, 9, 43, 0, 12.61};
  generic_qsort(d, d+7, less_double);
```

编译器在后台做了许多工作，使得程序员“毫不费力”就能写出通用的泛型代码，也就是类型无关的代码。有意思的是，C++ 本身是严格的静态类型语言，而目标却朝着让程序员编写无关类型的方向在发展。它似乎同时承诺类型安全和类型无关（或许还有性能）。这或许就是 C++ 这门语言的魅力。

这个例子让我们看到，C++ 努力消除 C 中的奇淫技巧，在并不以性能为代价的前提下，提供更加类型安全和通用的方案。这种泛型的思路显然和对象走的不是一路，尽管看起来都是支持多态类型。


## 问题的基础结构

数学上有名哥德巴赫猜想，我大概小学的时候就听说过，但现在才慢慢理解这个问题的意义：素数是否是整数的基石。对程序设计而言，如果存在这样的基石，我们所学要做的仅仅是将一切问题归为基于“基石”的问题，然后可以机械地自动计算。泛型算法的初衷就是寻找这样的基本结构及其之上的操作。比如排序可以表示为在一个线性空间上交换、比较等操作的集合。

使用这些基本的、正交的、在数学上有良好定义的基石搭建的系统，无疑更加可靠。尽管我们数学上无法证明（或许永远也无法证明）到底是那些基石，甚至都不知道是否存在，但不妨碍我们在实践中试用。

更重要的是，它提供了一种编码的目标：将问题分解为正交的子问题。分解的依据就是结构良好的泛型容器极其之上的算法。过程化的程序让你觉得编程就是一步一步的操作和循环，正像是原始的图灵机。函数式的程序让你觉得编程是在发现问题的递归结构。对象式的编程让你将世界看作相互交流的个体。而泛型让人惊奇的是，它尝试定义标准的数据结构及其之上的标准算法。这些数据结构并非对象，也不是函数，而是第一性的“结构”，或者理解为（结构上的）模式。古代哲学家试图总结世界构成的基本要素，而泛型在程序领域正在尝试给出类似的答案。

这种结构并不是表面上的形似的东西，而是反映问题本质的东西。以 qsort 为例，首先“大致地”排序，这个想法之所以可行是基于 qsort 作用于一种在线性空间上一种自相似的结构。qsort 的存在并非人类的智慧，而是首先存在能 qsort 的结构。这种本质性的结构，是数学家们终极的追求，也是程序应当最终写成的样子。泛型编程无疑是这一方向上的重要进步。


## 插入操作的实质

Bjarne Stroupstrup 举了这样一个真实的例子，怎样重构下面的代码：


```cpp
void drag_item_to(Vector& v, Vector::iterator source, Coordinate p)
{
  // find the insertion point
  Vector::iterator dest = find_if(v.begin(), v.end(), contains(p));

  if (source < dest)
    rotate(source, source+1, dest); // from before insertion point
  else
    rotate(dest, source, source+1); // from after insertion point
}
```

即使你很熟悉 rotate ，第一眼你不会想到这几行代码是作什么用。它是 vector 内部的移动操作，将 source 插到 dest 之前。数据类型和判断都是针对特定问题的。如果将它重构成泛型，这些特定的类型会被泛化，更重要的这个操作会将以基本、正交的操作表达出来，而不是各种条件判断和循环。这好比提取特征向量。

重构的代码如下：

```cpp
template < typename Iter, typename Predicate>
pair<Iter, Iter> gather(Iter first, Iter last, Iter p, Predicate pred)
  // move elements for which pred() is true to the insertion point p
{
  return make_pair(
      stable_partition(first, p, !bind(pred, _1)),  // from before insertion point
      stable_partition(p, last, bind(pred, _1))     // from after insertion point
  );
}
```

在线性随机访问空间 [i, j) 上将满足条件 p 的元素插入到位置 k：$insert(i, j, k, p)$，等价于将 [i, j) 分成 [i, k) 和 [k, j) 两个空间，分别用条件 !p 和 p 进行 partition 操作：

$$
insert(i,\ j,\ k,\ p) = partition(i,\ k,\ !p) \cup partition(k,\ j,\ p)
$$

很明显，partition 更本质，也更通用，更重要的是它用（重复的）自己定义了 insert，insert 被分解成为两个相同结构的子问题，这个分解像不像是发现问题的递归子结构？！将 insert 以 partition 的方式表达出来是不是显得更接近问题的实质，而且还更漂亮，更少的代码和 bug。C++ (STL) 将这种“子结构”平台搭建好，但需要 paradigm shift，才能发现其中之美。

实践意义上，泛化就像设计模式一样，除了提供的技巧之外，更重要的是指明了重构的目标：将代码用标准算法组装出来。

## 总结

C++11 的新风格“诱惑”我们使用泛型的思维方式，写（与STL兼容的）泛型代码，而编写泛型代码就是与具体类型细节无关的带代码，如果更泛，就与容器都无关，只依赖于迭代器，这种代码就完全是算法代码了。高阶的编程风格让代码更通用、更少bug，并且C++对这种风格的支持（各种优化）让程序更加高效。编写算法的代码比那些夹杂各种底层细节和逻辑条件循环的代码，更赏心悦目。


Bjarn Stroustrup[^1] 认为基于算法的代码还并未被主流系统编程文化所接受。（如 Linux 相关开发，大多数系统程序员更乐意使用传统C的编程风格）：

> Expressing code in terms of algorithms rather than hand-crafted, special-purpose code can lead to more readable code that's more likely to be correct, often more general, and often more efficient. Such code is also far more likely to be used again elsewhere. 
> 
> 用算法去表达代码，而不是手工编写特定功能的代码，这样的代码更可读，也可能更正确，通常也更通用、更高效。这样的代码也更可能在别处被重用。
> 
> However, making algorithm-based code mainstream requires a culture change among systems programmers. Analyzing problems with the aim of coming up with general, elegant, and simple solutions isn't emphasized in the education of or selection of systems programmers. Too many programmers take pride in complicated solutions (invariably assumed to be efficient), and too many managers are more impressed with such code than with simpler alternatives.
> 
> 但是，基于算法的代码要求主流的编程文化有所改变。通用、优雅、简单的方案并非系统程序员的优选。太多的程序员骄于他们复杂的解决方案，相比更简单的做法，却能得到更多经理的欣赏。
> <cite> Bjarn Stroustrup[^2] </cite>


最后，如果你看到这里，是不是有种误会了 C++ 的感觉？

[^1]: Bjarne Stroustrup 在 [GoingNative 2012](http://channel9.msdn.com/Events/GoingNative/GoingNative-2012/Keynote-Bjarne-Stroustrup-Cpp11-Style) 上的 Keynote


[^2]: IEEE Computer Society 2012. Bjarne Stroustrup. [Software Development for Infrastructure](http://www.stroustrup.com/Software-for-infrastructure.pdf)


