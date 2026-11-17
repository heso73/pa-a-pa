// Run in studio.youtube.com/channel/<id>/videos/upload?d=ud (built-in browser, javascript_tool). Set P from plan.json entry first.
// const P = {f, title, desc, day};
const w=ms=>new Promise(r=>setTimeout(r,ms));
await w(2500);
const inp=document.querySelector('input[type=file]');
const dt=new DataTransfer();
const b=await (await fetch('https://raw.githubusercontent.com/heso73/pa-a-pa/media/'+P.f+'.mp4')).blob();
dt.items.add(new File([b],P.f+'.mp4',{type:'video/mp4'}));
inp.files=dt.files; inp.dispatchEvent(new Event('change',{bubbles:true}));
await w(8000);
const D=()=>document.querySelector('ytcp-uploads-dialog');
const err=D().querySelector('.error-short')?.innerText; if(err&&/Limite/.test(err)) return 'LIMIT: '+err;
const set=(sel,t)=>{const e=D().querySelector(sel);e.focus();document.execCommand('selectAll');document.execCommand('insertText',false,t);};
set('#title-textarea #textbox',P.title); set('#description-textarea #textbox',P.desc);
D().querySelector('[name=VIDEO_MADE_FOR_KIDS_NOT_MFK]').click(); await w(800);
for(let i=0;i<3;i++){D().querySelector('#next-button').click();await w(2000);}
D().querySelector('#second-container-expand-button').click(); await w(1500);
const pk=D().querySelector('ytcp-datetime-picker');
pk.querySelector('ytcp-text-dropdown-trigger, #datepicker-trigger').click(); await w(2000);
const cell=[...document.querySelectorAll('ytcp-date-picker .calendar-day')].find(e=>e.innerText.trim()===P.day);
cell.click(); await w(800);                       // date FIRST (it resets the time)
const ti=pk.querySelector('tp-yt-paper-input input'); ti.click(); ti.focus(); await w(800);
[...document.querySelectorAll('tp-yt-paper-item, [role=option]')].find(e=>(e.innerText||'').trim()==='12:00').click(); await w(800);
const res={date:pk.innerText.replace(/\s+/g,' ').match(/\d+ \S+ 2026/)?.[0],time:ti.value};
const e2=D().querySelector('.error-short')?.innerText; if(e2) res.err=e2;
if(!e2&&res.date.startsWith(P.day+' ')&&res.time==='12:00'){D().querySelector('#done-button').click(); await w(12000); res.done=true; res.after=document.body.innerText.match(/Votre vidéo sera[\s\S]{0,90}/)?.[0];}
JSON.stringify(res)
