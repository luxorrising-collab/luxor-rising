// A safety net for every next/image on the site.
//
// Photos go through Vercel's on-demand image service (/_next/image?url=…). When
// a resized version can't be produced — the plan's monthly image quota used up
// (HTTP 402), or the service failing — the browser would show a broken image.
// This tiny script, inlined before any image loads, catches that error and swaps
// in the original file from /public instead (dropping srcset and any <picture>
// sources), so the visitor still sees the photo. One inline listener covers
// server and client components alike, with no change to each <Image>.
const SCRIPT = `(function(){
  function raw(u){try{var x=new URL(u,location.href);return x.pathname==="/_next/image"?x.searchParams.get("url"):null}catch(e){return null}}
  function fix(img){
    if(img.getAttribute("data-raw"))return;
    var r=raw(img.currentSrc||img.src);if(!r)return;
    img.setAttribute("data-raw","1");
    var p=img.parentNode;
    if(p&&p.tagName==="PICTURE"){var s=p.querySelectorAll("source");for(var i=0;i<s.length;i++)s[i].parentNode.removeChild(s[i])}
    img.removeAttribute("srcset");img.removeAttribute("sizes");img.src=r;
  }
  document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG")fix(t)},true);
  function sweep(){var a=document.images;for(var i=0;i<a.length;i++){if(a[i].complete&&a[i].naturalWidth===0)fix(a[i])}}
  if(document.readyState==="complete")sweep();else window.addEventListener("load",sweep);
})();`;

export default function ImageFallback() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
