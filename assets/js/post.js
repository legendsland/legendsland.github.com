
function init_toc () {
// back top
$('#menu ul').append('<li><a href="#">' + $('.header h1').text() + '</a></li>');

// blog articles use <h4> as paragraphy title. Set h4 link name for anchors in table of contents.
$('.content h2').each(function(index) {
  var id = $(this).attr('id'); // id generated by markdown
  var name = $(this).text();

  $(this).attr('name', id);

  // add anchors above to TOC
  $('#menu .toc').append('<li><a href="#' + id + '">' + name + '</a></li>');

  // change selected
  $('#menu .toc li').click(function() {
    if( $(this).hasClass('pure-menu-selected') === false) {
      $('.pure-menu-selected', $('#menu .toc')).removeClass('pure-menu-selected');
      $(this).addClass('pure-menu-selected');
    }
  });
});

  $('#menu .toc li:first-child').addClass('pure-menu-selected');
}

function toggle(el, showtxt, hidetxt) {
	el.toggle();
	console.log( el.prev());
	if( el.is(":hidden") ) {
		el.prev().text(showtxt);
	} else {
		el.prev().text(hidetxt);
	}
}

// onload
$( function() {


		    // generate table of contents
        init_toc();

        // 将 post 中的链接在新窗口中打开，或者在 md 中直接指定
        $(".content a[href^='http://']").attr("target", "_blank");

        // 注册 img click 在新窗口中查看
        $(".post-img").click( function() {
          $(this).target = "_blank";
          window.open($('img', this).attr('src'));
          return false;
        })
        .append( '<p>点击在新窗口打开查看大图</p>' )
        .mouseover( function() {
          $('p', this).css("visibility","visible");
        })
        .mouseout( function() {
          $('p', this).css("visibility","hidden");
        });

        /* change default gist style 
         * TODO: 这是临时做法，对更丰富的 style，需要用独立的 css 文件
         * */
        $('.gist').wrap( "<div class='gist-container' style='font-size:13px !important;'></div>" );

        // 如果有数学公式，加载 MathJax
        // 目前根据 post 里面是否存在 $..$ 判断
        // 对于 block math 使用 $$..$$ 被转换成了 <![CDATA[  下面的方法无法判断
        // 但对于存在 block math 的 post 一定都存在 inline 的 symbol
        if( null !== $('#main').text().match(/\$([^$]+)\$/) ) { // 不带 g 只需要检测到第一个存在即可
 
          // TODO: fucking slow
          $.getScript("http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML", function(){
             MathJax.Hub.Config({
                jax: ["input/TeX", "output/HTML-CSS"],
                tex2jax: {
                  inlineMath: [ ['$','$'], ["\\(","\\)"] ],
                  displayMath: [ ['$$', '$$'], ["\\[", "\\]"] ],
                  processEscapes: true
              }
            });
          });
        }

        // 给 footnotes 之上增加分割线
        $('.footnotes').before('<hr>');

});

