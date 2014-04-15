---
layout: post
title: Lottery-Oriented Programming
description: 
categories: [blog]
---

I still remember a university classmate who tried to write programs on paper while other of us failed to program on computer. He did all thinking, analysis and maybe some proof to make sure the program was correct, and then type the program into the computer in lab, debug and run it, all done in about half an hour. The first time when I found people programming this way, I was astonished and thought how could someone program without any computer?

Afterwards I slowly realized this is the most important technique of programming that can actually tell whether you're programming or lotterying that you throw the code into compiler and wish get good luck. And it doesn't matter if you don't get any luck because you can try it again, freely.

Try it again. This sounds like a good student who's not afraid of failure and just keeping trying. However, it's more like the crazy people described by Einstein: the insane is trying to repeat same thing over and over again, but expecting different result. Also, a aged professor of computer science once said, in the past they would think carefully about the correctness of punching programs because both debugging and running were inconvenient. But now, you people just throw rubbish into the computer and see whether it works. This is just *lottery-oriented programming*, the main programming mythology in 21st.

Lottery is low-IQ tax.

On the contrary, is [Ken Thompson-back against method][1], Rob Pike wrote:

> A year or two after I'd joined the Labs, I was pair programming with Ken Thompson on an on-the-fly compiler for a little interactive graphics language designed by Gerard Holzmann. I was the faster typist, so I was at the keyboard and Ken was standing behind me as we programmed. We were working fast, and things broke, often visibly—it was a graphics language, after all. When something went wrong, I'd reflexively start to dig in to the problem, examining stack traces, sticking in print statements, invoking a debugger, and so on. But Ken would just stand and think, ignoring me and the code we'd just written. After a while I noticed a pattern: Ken would often understand the problem before I would, and would suddenly announce, "I know what's wrong." He was usually correct. I realized that Ken was building a mental model of the code and when something broke it was an error in the model. By thinking about *how* that problem could happen, he'd intuit where the model was wrong or where our code must not be satisfying the model.
> 
> Ken taught me that thinking before debugging is extremely important. If you dive into the bug, you tend to fix the local issue in the code, but if you think about the bug first, how the bug came to be, you often find and correct a higher-level problem in the code that will improve the design and prevent further bugs.
> 
> I recognize this is largely a matter of style. Some people insist on line-by-line tool-driven debugging for everything. But I now believe that thinking—without looking at the code—is the best debugging tool of all, because it leads to better software.

The best and worst debugging tool are both *printf*. It depends on whether you are really thinking and add some *printf* at critical place to print accurate information rather than adding randomly. And it's better to check stack if you do that.

What would happen if Perlman sits behind you when you're playing violin, and Picasso when you're drawing, Hemingway when you're writing, Steve Jobs when you're designing, and Sheldon when you're working on string theory.

Will you make some noise, dirt, crap, bullshit, or multiplication error and then turn your head to look at their face to know it's not *satisfying*? Usually you don't, because you don't want to make them think you're stupid, you care about those authorities' opinion.

So, Why let computer think you're stupid when you're alone?


[1]: http://www.informit.com/articles/article.aspx?p=1941206


