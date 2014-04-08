/**
 * templates
 */

// 将精确时间转换成 Human readable
function comment_time( datestring ) {//"2014-04-08T05:50:37.803Z" 
  return datestring ? datestring.substr(0,10) : ""; 
}

function commenter_url (commenter) {
  var re_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi;
  var re_url = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var re_url_http = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
  
  if( re_email.test(commenter) ) {
    return '<a href="mailto:' + commenter + '">' + commenter + '</a>';
  } else if( re_url.test(commenter) ) {
    return '<a href="http://' + commenter + '">' + commenter + '</a>';
  } else if( re_url_http.test(commenter) ) {
    return '<a href="' + commenter + '">' + commenter + '</a>';
  } else {
    return commenter;
  }
}


  var tpl = {
   
  newest: (function(){/*
    <p><%= commenter_url(cmt.commenter) %>: <%= cmt.content %></p>

  */}).toString().split('\n').slice(1, -1).join('\n')

  ,comment: (function(){ /*
<div class="discussion-bubble js-comment-container">
   <img class="discussion-bubble-avatar" src="/assets/images/chimp_48.jpg" width="48" height="48">
   <div class="discussion-bubble-content bubble">
    <div class="discussion-bubble-inner">
      <div id="comment-<%= cmt.id %>" class="comment js-comment ">
        <div class="comment-header normal-comment-header">
          <a class="comment-type-icon octicon octicon-comment" href="#"></a>
          <span class="comment-header-author"><%= commenter_url(cmt.commenter) %></span>

          <span class="comment-header-right">
            <span>
              <time class="comment-header-date"><%= comment_time(cmt.date) %></time>
            </span>
          </span>
        </div>

        <div class="comment-content">
          <div class="edit-comment-hide">
            <div class="comment-body markdown-body markdown-format js-comment-body">
                <p><%= cmt.content %></p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
  </div>
  */}).toString().split('\n').slice(1, -1).join('\n')

  };


