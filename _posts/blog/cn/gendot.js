// 将数组转成 dot src
var dot = '';
function gendot(arr, id) {
  
  var node = '"' + arr[0] + '[' + id + ']"';
  var node_with_label = '"' + arr[0] + '[' + id + ']"' + '[label="' + arr[0] + '"]';
  var node_with_label_and_style = '"' + arr[0] + '[' + id + ']"' + '[style=filled, fillcolor="#DD1144", label="' + arr[0] + '"]';
  var eol = ';\n';

  if( arr.length == 0 ) {}
  else if( arr.length == 1 ) {
    dot += node_with_label_and_style + eol;
  } 
  else {
    for(var i=1; i<arr[0]+1 && i<arr.length; ++i) {
      
      var subnode = '"' + arr[i] + '[' + id + '-' + i  + ']"';

      //out
      if (arr[0]+1 > arr.length) {
        dot += node_with_label_and_style + eol;
        dot += node + '->' + subnode + eol;
      } else {
        dot += node_with_label;
        dot += node + '->' + subnode + eol;
      }

      gendot( arr.slice(i, arr.length), id+'-'+i);  // recur depth
    }
  }
}

gendot([1,3,5,2,9,3,4,1,8], 0);
console.log('digraph G {' + dot  + '}');



