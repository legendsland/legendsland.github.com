---
layout: page
title: Blog
---
<div class="category">
    <ul>
    {% for post in site.categories.blog %}
        <li>
            <h2>
            <a href="{{ post.url }}">{{ post.title }}</a>
            </h2>
            <span>{{ post.description }}</span>
        </li>
    {% endfor %}
    </ul>

<ul>
  {% assign categories_list = site.categories %}
  {% include JB/categories_list %}
</ul>

</div><!-- .entry -->
