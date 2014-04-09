
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
	if( el.is(":hidden") ) {
		el.prev().text(showtxt);
	} else {
		el.prev().text(hidetxt);
	}
}

function add_first_comment(new_comment, cb) {
 
  var page_url = window.location.pathname;

    cmt_idx.content.push( {"page":page_url,"path":1+parseInt(cmt_idx.max_id)+""} )

    // add new page
    $.ajax({
      url: 'https://api.github.com/repos/oc-github/gt-cmt/contents/comments?access_token=7c6ff84c0dcf15f18aece934fd332006d92f52bd',
      type: 'PUT',
      data: JSON.stringify( {
        "message": "new commit file",
        "committer": {
          "name": "oc.github",
          "email": "oc.github@gmail.com"
        },
        "content": btoa(unescape(encodeURIComponent(JSON.stringify( cmt_idx.content )))),
        "sha": cmt_idx.sha
      }),
      success: function (data) {
        // create page comment file
        $.ajax({
          url: 'https://api.github.com/repos/oc-github/gt-cmt/contents/' + (++cmt_idx.max_id) + '?access_token=7c6ff84c0dcf15f18aece934fd332006d92f52bd',
          type: 'PUT',
          data: JSON.stringify( {
            "message": "new comment",
            "committer": {
              "name": "oc.github",
              "email": "oc.github@gmail.com"
            },
            "content": btoa(unescape(encodeURIComponent(JSON.stringify( [new_comment] )))),
            "sha": cmt_idx.sha
          }),
          success: function (data) {

          }
        });

        cb(data);
      }
    });
}


function add_comment( new_comment, cb ) {

  cmt.comments.push( new_comment );

  // 如果该page已经有评论，直接添加
  $.ajax({
    url: 'https://api.github.com/repos/oc-github/gt-cmt/contents/' + cmt.path + '?access_token=7c6ff84c0dcf15f18aece934fd332006d92f52bd',
    type: 'PUT',
    data: JSON.stringify( {
      "message": "new comment",
      "committer": {
        "name": "oc.github",
        "email": "oc.github@gmail.com"
      },
      "content": btoa(unescape(encodeURIComponent(JSON.stringify( cmt.comments )))),
      "sha": cmt.sha
    }),
    success: function (data) {
      cb(data);
    //  $.get('https://api.github.com/repos/oc-github/gt-cmt/contents/comments.json', function (data) {
    //    $('.comment').html( decodeURIComponent( escape( atob(data.content) )) );
    //  });
    }
  });

}

var cmt_idx = {};
var cmt = {};
function load_comments( ) {

  var raw_url = window.location.pathname;

  $.get('https://api.github.com/repos/oc-github/gt-cmt/contents/comments', function (data) {

     cmt_idx.content = JSON.parse( decodeURIComponent( escape( atob(data.content) )));
     cmt_idx.sha = data.sha;
     cmt_idx.max_id = 0;

     $.each(cmt_idx.content, function(i,c) {

       if( c.path > cmt_idx.max_id ) cmt_idx.max_id = c.path;  // get max id : string !!!!

       // found page comments
       if( c.page === raw_url ) {
          $.get('https://api.github.com/repos/oc-github/gt-cmt/contents/' + c.path, function (data) {
            cmt.path = c.path;
            cmt.comments = JSON.parse( decodeURIComponent( escape( atob(data.content) )));
            cmt.sha =  data.sha;

            /* 显示评论框 */
            $.each( cmt.comments, function(i, c) {
              $('.comments').append( _.template(tpl.comment, {cmt: c}) ); 
            });

          });
        }
    });
  });
}

// onload
$( function() {

        load_comments();//

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
        $('.gist').wrap( "<div class='highlight'><code></code></div>" );
        
        // 给 footnotes 之上增加分割线
        $('.footnotes').before('<hr>');

        // comment submit button
        $('.comment-add button').click(function() {
            // get comment content
            var commenter = $('.comment-header textarea').val();
            var comment = $('.comment-content textarea').val();
            var add_cmt = add_comment;

            if( cmt.path === undefined ) 
              add_cmt = add_first_comment;

            var c = {"id": "unknown", "commenter": commenter || "Anonymous", "content":  comment,  "date": new Date().toJSON() }

            add_cmt(c,  function(d) {
              $('.comments').append( _.template(tpl.comment, {cmt: c}) );

              // clear prev textarea
              $('.comment-header textarea').val('');
              $('.comment-content textarea').val('');

            });
        });

});

