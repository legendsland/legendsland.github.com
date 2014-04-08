/**
 * 生成 jade 模板
 */


  var tpl = {
    
  comment: (function(){ /*



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


