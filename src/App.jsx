import { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "./lib/supabase";

const uid = () => Math.random().toString(36).slice(2, 9);
const todayStr = () => new Date().toISOString().slice(0, 10);
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const POST_TYPES = ["Reels","Carrossel","Stories","TikTok","Post foto"];
const POST_STATUS = ["Planejado","Em produção","Publicado","Pausado"];
const IDEA_CATS = ["Todos","Beleza","Skincare","Lifestyle","Motivacional","UGC","Moda","Outro"];
const HOOK_CATS = ["Todos","Pergunta","Choque","Promessa","História","Polêmica","Curiosidade"];
const BRAND_DREAM_STATUS = ["Quero muito","Contatada","Negociando","Fechada","Descartada"];
const CRM_STATUS = ["Lead","Ativo","Negociando","Parceiro","Inativo"];
const PLAT_CATS = ["Todos","Influencer","UGC","Ferramentas"];
const PERIODS = ["Manhã","Tarde","Noite"];
const GRAVAR_CATS = ["Todos","Reels","Carrossel","Stories","TikTok","UGC","Outro"];
const GRAVAR_STATUS = ["Para gravar","Gravado","Descartado"];
const EDITAR_CATS = ["Todos","Reels","Carrossel","Stories","TikTok","UGC","Outro"];
const EDITAR_STATUS = ["Para editar","Editando","Pronto","Publicado"];
const postColor = t => ({Reels:"#FF6B6B",Carrossel:"#FFB347",Stories:"#74B9FF",TikTok:"#A29BFE","Post foto":"#55D496"})[t]||"#CCC";
const roteiroText = r => [r?.hook && `HOOK - ${r.hook}`, r?.body, r?.cta && `CTA - ${r.cta}`].filter(Boolean).join("\n\n");
const authRedirectUrl = () => import.meta.env.VITE_AUTH_REDIRECT_URL?.trim() || window.location.origin;

const INIT = {
  profile:{ name:"",handle:"",bio:"",email:"",phone:"",location:"Caruaru, PE",niche:"Beleza · Skincare · Lifestyle",presentation:"",followers:"",engagement:"",avgReach:"",mediakit:"" },
  ideas:[], crm:[], brands:[], calendar:[], roteiros:[],
  hooks:[
    {id:"h1",text:"Você faz isso todo dia e nem percebe que está destruindo sua pele...",cat:"Choque"},
    {id:"h2",text:"Me conta nos comentários: você tem feito isso na sua rotina?",cat:"Pergunta"},
    {id:"h3",text:"Em 30 dias minha pele mudou completamente — aqui está o que eu fiz:",cat:"Promessa"},
    {id:"h4",text:"Eu passei anos sem saber disso e quando descobri tudo mudou:",cat:"História"},
    {id:"h5",text:"Ninguém fala sobre isso mas deveria:",cat:"Polêmica"},
    {id:"h6",text:"O segredo que profissionais de beleza não contam:",cat:"Curiosidade"},
  ],
  platforms:[
    {id:"p1",name:"Squid",url:"https://squid.live",desc:"Plataforma brasileira de marketing de influência com grandes marcas.",cat:"Influencer"},
    {id:"p2",name:"Airfluencers",url:"https://airfluencers.com",desc:"Marketplace que conecta influencers e marcas brasileiras.",cat:"Influencer"},
    {id:"p3",name:"Influence4You",url:"https://influence4you.com/br",desc:"Campanhas pagas para influencers de todos os nichos.",cat:"Influencer"},
    {id:"p4",name:"Yuool",url:"https://yuool.com.br",desc:"Plataforma focada em UGC — vende o vídeo, não o alcance.",cat:"UGC"},
    {id:"p5",name:"Voltan",url:"https://voltan.com.br",desc:"Conecta marcas e criadores para produção de UGC.",cat:"UGC"},
    {id:"p6",name:"Later",url:"https://later.com",desc:"Agendamento e análise de posts para Instagram.",cat:"Ferramentas"},
    {id:"p7",name:"CapCut",url:"https://capcut.com",desc:"Edição de vídeos para Reels e TikTok, com templates.",cat:"Ferramentas"},
    {id:"p8",name:"Canva",url:"https://canva.com",desc:"Criação de artes para feed, stories e mídia kit.",cat:"Ferramentas"},
  ],
  ugcRefs:[], creators:[
    {id:"c1",handle:"@biancaandrade",platform:"Instagram",niche:"Beleza & Lifestyle",notes:"Tom acolhedor, review honesto de skincare"},
    {id:"c2",handle:"@camilacoelho",platform:"Instagram",niche:"Beleza & Moda",notes:"Referência de parcerias com marcas internacionais"},
    {id:"c3",handle:"@thaissacardoso",platform:"Instagram/TikTok",niche:"Lifestyle & Autocuidado",notes:"Ótima referência de conteúdo motivacional"},
  ],
  media:[], planner:{}, gravar:[], editar:[],
  sitesdiarios:[
    {id:"s1",name:"Vogue Brasil",url:"https://vogue.globo.com",cat:"Moda",desc:"Moda, beleza e cultura de luxo"},
    {id:"s2",name:"Glamour BR",url:"https://glamour.globo.com",cat:"Beleza",desc:"Beleza, moda e lifestyle feminino"},
    {id:"s3",name:"Elle Brasil",url:"https://elle.com.br",cat:"Moda",desc:"Moda, tendências e estilo de vida"},
    {id:"s4",name:"Marie Claire BR",url:"https://marieclaire.globo.com",cat:"Lifestyle",desc:"Comportamento, saúde e moda"},
    {id:"s5",name:"Casa Vogue",url:"https://casavogue.globo.com",cat:"Decoração",desc:"Decoração, arquitetura e design"},
    {id:"s6",name:"Architectural Digest BR",url:"https://archdigest.com.br",cat:"Decoração",desc:"Design de interiores e arquitetura"},
    {id:"s7",name:"Minha Vida",url:"https://minhavida.com.br",cat:"Saúde",desc:"Saúde, bem-estar e autocuidado"},
    {id:"s8",name:"Hypeness",url:"https://hypeness.com.br",cat:"Lifestyle",desc:"Tendências, cultura e novidades"},
    {id:"s9",name:"Metrópoles",url:"https://metropoles.com",cat:"Informação",desc:"Notícias, entretenimento e lifestyle"},
    {id:"s10",name:"Harper's Bazaar BR",url:"https://harpersbazaar.uol.com.br",cat:"Moda",desc:"Moda de luxo, beleza e lifestyle"},
    {id:"s11",name:"Allure",url:"https://allure.com",cat:"Beleza",desc:"Referência mundial em beleza e skincare"},
    {id:"s12",name:"Who What Wear",url:"https://whowhatwear.com",cat:"Moda",desc:"Tendências de moda acessíveis e inspiração"},
  ],
  automations:{
    checklist:[
      {id:"a1",text:"Revisar legenda e hashtags",done:false},
      {id:"a2",text:"Verificar melhor horário de postagem",done:false},
      {id:"a3",text:"Adicionar localização / tag de marca",done:false},
      {id:"a4",text:"Checar thumbnail do Reel",done:false},
      {id:"a5",text:"Programar stories de divulgação",done:false},
      {id:"a6",text:"Responder comentários nas primeiras 2h",done:false},
    ],
    hashtagSets:[], captionTemplates:[], dmTemplates:[]
  },
  pin:null, pinEnabled:false,
};

const mergeData = saved => {
  const safe = saved && typeof saved === "object" ? saved : {};
  const merged = { ...INIT, ...safe };
  Object.keys(INIT).forEach(k => {
    if (Array.isArray(INIT[k]) && !Array.isArray(merged[k])) merged[k] = [...INIT[k]];
    if (INIT[k] !== null && typeof INIT[k] === "object" && !Array.isArray(INIT[k])) {
      const value = safe[k] && typeof safe[k] === "object" && !Array.isArray(safe[k]) ? safe[k] : {};
      merged[k] = { ...INIT[k], ...value };
    }
  });
  return merged;
};

const NAV_ITEMS = [
  {sec:"Principal"},
  {id:"dashboard",ico:"▪",label:"Dashboard"},
  {id:"calendar",ico:"▦",label:"Content Calendar"},
  {id:"planner",ico:"▤",label:"Planner Semanal"},
  {sec:"Criação"},
  {id:"ideas",ico:"◈",label:"Banco de Ideias"},
  {id:"hooks",ico:"◆",label:"Hooks Virais"},
  {id:"roteiros",ico:"▣",label:"Roteiros"},
  {id:"gravar",ico:"●",label:"Para Gravar"},
  {id:"editar",ico:"◧",label:"Para Editar"},
  {id:"media",ico:"◑",label:"Upload de Mídia"},
  {sec:"Parcerias"},
  {id:"brands",ico:"♡",label:"Marcas dos Sonhos"},
  {id:"crm",ico:"◎",label:"CRM de Marcas"},
  {id:"platforms",ico:"◉",label:"Plataformas"},
  {sec:"Inspiração"},
  {id:"tendencias",ico:"◉",label:"Tendências IA"},
  {id:"sitesdiarios",ico:"▦",label:"Sites Diários"},
  {id:"creators",ico:"◒",label:"Creators"},
  {id:"ugc",ico:"◐",label:"Refs UGC"},
  {sec:"Config"},
  {id:"profile",ico:"○",label:"Meu Perfil"},
  {id:"automations",ico:"⚙",label:"Automações"},
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif}
.app{display:flex;height:100vh;background:#F5F5F3;color:#0A0A0A;overflow:hidden}
/* sidebar */
.sb{width:214px;background:#fff;border-right:1px solid #EAEAE6;display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto}
.sb-logo{padding:20px 18px 16px;border-bottom:1px solid #F2F2EE}
.sb-brand{font-size:18px;font-weight:800;letter-spacing:-0.4px}
.sb-tag{font-size:9.5px;color:#ADADAA;margin-top:1px}
.sb-nav{flex:1;padding:6px 0}
.sb-sec{font-size:9px;font-weight:800;color:#C8C8C0;text-transform:uppercase;letter-spacing:.1em;padding:13px 16px 3px}
.sb-item{display:flex;align-items:center;gap:8px;padding:7px 16px;font-size:12.5px;font-weight:500;color:#7A7A76;cursor:pointer;border-left:2px solid transparent;transition:all .1s;user-select:none}
.sb-item:hover{color:#0A0A0A;background:#F8F8F5}
.sb-item.on{color:#0A0A0A;background:#F0F0EC;font-weight:700;border-left-color:#0A0A0A}
.sb-ico{font-size:12px;width:16px;text-align:center;flex-shrink:0}
.sb-foot{padding:12px 16px;border-top:1px solid #F2F2EE;display:flex;align-items:center;gap:9px}
.sb-av{width:28px;height:28px;border-radius:50%;background:#0A0A0A;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0}
.sb-fn{font-size:12px;font-weight:700}
.sb-fh{font-size:11px;color:#ADADAA}
/* main */
.main{flex:1;overflow-y:auto}
.page{padding:34px 40px;max-width:960px;animation:fi .18s ease}
@keyframes fi{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
.pg-welcome{font-size:12px;color:#ADADAA;margin-bottom:4px}
.pg-title{font-size:30px;font-weight:800;letter-spacing:-0.8px;line-height:1.1;margin-bottom:3px}
.pg-sub{font-size:13px;color:#ADADAA;margin-bottom:26px}
/* hero */
.hero{background:#0A0A0A;border-radius:16px;padding:28px 32px;color:#fff;position:relative;overflow:hidden;margin-bottom:18px}
.hero::after{content:'';position:absolute;right:-60px;top:-90px;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.03);pointer-events:none}
.hero-tag{font-size:9.5px;font-weight:700;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px}
.hero-h{font-size:24px;font-weight:800;letter-spacing:-0.5px;line-height:1.2;margin-bottom:6px;max-width:480px}
.hero-s{font-size:12.5px;color:rgba(255,255,255,.4);line-height:1.65;max-width:420px}
.hero-btns{margin-top:18px;display:flex;gap:8px}
/* stats */
.stat-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:9px;margin-bottom:22px}
.sc{background:#fff;border:1px solid #EAEAE6;border-radius:12px;padding:14px 16px}
.sc-n{font-size:26px;font-weight:800;letter-spacing:-0.8px;line-height:1}
.sc-l{font-size:10px;color:#ADADAA;margin-top:4px;font-weight:500;text-transform:uppercase;letter-spacing:.04em}
/* buttons */
.btn{display:inline-flex;align-items:center;gap:5px;padding:8px 16px;border-radius:8px;font-size:12.5px;font-family:inherit;font-weight:600;cursor:pointer;border:none;transition:all .1s;line-height:1;white-space:nowrap}
.btn-k{background:#0A0A0A;color:#fff}.btn-k:hover{background:#2A2A2A}
.btn-w{background:#fff;color:#0A0A0A}.btn-w:hover{background:#F5F5F3}
.btn-o{background:transparent;border:1.5px solid #DDDDD8;color:#6A6A66}.btn-o:hover{border-color:#0A0A0A;color:#0A0A0A}
.btn-r{background:transparent;border:1.5px solid #F5D5D8;color:#A84050}.btn-r:hover{background:#FEF0F2}
.btn-sm{padding:6px 12px;font-size:12px;border-radius:7px}
.btn-xs{padding:3px 8px;font-size:11px;border-radius:6px}
/* forms */
.field{margin-bottom:12px}
label,.lbl{display:block;font-size:10px;font-weight:700;color:#ADADAA;text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px}
input,textarea,select{font-family:inherit;font-size:13px;color:#0A0A0A;background:#FAFAF8;border:1.5px solid #EAEAE6;border-radius:8px;padding:9px 12px;width:100%;outline:none;transition:border-color .12s}
input:focus,textarea:focus,select:focus{border-color:#0A0A0A;background:#fff}
textarea{resize:vertical;min-height:80px;line-height:1.6}
/* badges */
.badge{display:inline-block;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:600}
.bk{background:#0A0A0A;color:#fff}.bl{background:#F0F0EC;color:#4A4A46}
.bblue{background:#EAF2FF;color:#1A5FA0}.bgreen{background:#E4F5EC;color:#1A6A40}
.bamber{background:#FFF3DC;color:#8A5500}.brose{background:#FFE8EC;color:#A02040}
.bpurple{background:#EDE8FF;color:#5030A0}.bgray{background:#F2F2EE;color:#6A6A66}
/* card */
.card{background:#fff;border-radius:12px;border:1px solid #EAEAE6}
.cp{padding:18px 20px}
.g2{display:grid;grid-template-columns:repeat(auto-fill,minmax(238px,1fr));gap:11px}
/* section header */
.sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.st{font-size:16px;font-weight:700;letter-spacing:-0.3px}
/* divider */
.dv{height:1px;background:#EAEAE6;margin:22px 0}
/* empty */
.empty{text-align:center;padding:48px 20px;color:#ADADAA}
.empty-ico{font-size:28px;margin-bottom:8px}
.empty-t{font-size:13px;line-height:1.6}
/* filter */
.fr{display:flex;gap:5px;flex-wrap:wrap}
.fb{padding:4px 12px;border-radius:99px;font-size:12px;font-weight:500;cursor:pointer;border:1.5px solid #E4E4E0;background:transparent;color:#7A7A76;font-family:inherit;transition:all .1s}
.fb.on{background:#0A0A0A;color:#fff;border-color:#0A0A0A}
/* modal */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(4px)}
.modal{background:#fff;border-radius:16px;padding:28px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 16px 50px rgba(0,0,0,.1)}
.mt{font-size:20px;font-weight:800;letter-spacing:-0.4px;margin-bottom:20px}
.mr{display:flex;gap:8px;justify-content:flex-end;margin-top:18px;border-top:1px solid #F2F2EE;padding-top:16px}
/* grid helpers */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px}
/* calendar */
.cal-hd{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.cal-month{font-size:20px;font-weight:800;letter-spacing:-0.4px;min-width:190px}
.wdr{display:grid;grid-template-columns:repeat(7,1fr)}
.wd{text-align:center;font-size:9.5px;font-weight:700;color:#ADADAA;text-transform:uppercase;letter-spacing:.05em;padding:5px 0}
.cgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.day{min-height:70px;background:#fff;border-radius:8px;border:1.5px solid #EAEAE6;padding:5px 6px;cursor:pointer;transition:border-color .1s}
.day:hover{border-color:#0A0A0A}
.day.today{border-color:#0A0A0A;background:#FAFAF8}
.day.other{opacity:.22;pointer-events:none}
.dn{font-size:11.5px;font-weight:600;color:#7A7A76;margin-bottom:2px}
.today .dn{color:#0A0A0A}
.pdot{width:7px;height:7px;border-radius:50%;display:inline-block;margin:1px}
/* planner */
.planner-grid{display:grid;grid-template-columns:60px repeat(7,1fr);background:#fff;border:1px solid #EAEAE6;border-radius:12px;overflow:hidden}
.pl-hd{background:#F8F8F5;border-bottom:2px solid #0A0A0A;padding:8px 6px;text-align:center;font-size:11px;font-weight:700;border-right:1px solid #EAEAE6}
.pl-hd:last-child{border-right:none}
.pl-period{font-size:9px;font-weight:800;color:#ADADAA;text-transform:uppercase;letter-spacing:.06em;background:#F8F8F5;border-right:2px solid #0A0A0A;border-bottom:1px solid #EAEAE6;display:flex;align-items:center;justify-content:center;writing-mode:vertical-rl;text-orientation:mixed;padding:4px 2px}
.pl-cell{min-height:84px;border-right:1px solid #EAEAE6;border-bottom:1px solid #EAEAE6;padding:5px 7px;cursor:pointer}
.pl-cell:hover{background:#FAFAF8}
.pl-cell:last-child{border-right:none}
.pl-task{font-size:10.5px;background:#F0F0EC;border-radius:5px;padding:3px 7px;margin-bottom:3px;color:#0A0A0A;font-weight:500;line-height:1.4;display:flex;align-items:center;gap:4px;cursor:pointer}
.pl-task.done{opacity:.5;text-decoration:line-through}
.pl-add{font-size:10px;color:#C0C0BC;cursor:pointer;margin-top:2px}
.pl-add:hover{color:#0A0A0A}
/* hooks */
.hk-card{background:#fff;border:1.5px solid #EAEAE6;border-radius:12px;padding:16px 18px;transition:border-color .12s}
.hk-card:hover{border-color:#0A0A0A}
.hk-text{font-size:14px;font-weight:500;font-style:italic;color:#0A0A0A;line-height:1.55;margin-bottom:10px}
/* crm */
.crm-card{background:#fff;border:1.5px solid #EAEAE6;border-radius:12px;padding:17px 19px}
/* gravar / editar */
.gc{background:#fff;border:1.5px solid #EAEAE6;border-radius:12px;padding:17px 20px;transition:border-color .12s}
.gc:hover{border-color:#0A0A0A}
.gc-title{font-size:14px;font-weight:700;color:#0A0A0A;margin-bottom:5px}
.gc-body{font-size:12.5px;color:#6A6A66;line-height:1.6;margin-bottom:10px;white-space:pre-wrap}
.status-dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0}
.priority-bar{height:3px;border-radius:2px;margin-bottom:10px}
/* media */
.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:9px}
.mitem{border-radius:9px;overflow:hidden;aspect-ratio:1;position:relative;background:#F0F0EC;border:1.5px solid #EAEAE6;cursor:pointer}
.mimg{width:100%;height:100%;object-fit:cover}
.mov{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .13s}
.mitem:hover .mov{opacity:1}
.drop-zone{border:2px dashed #DDDDD8;border-radius:12px;padding:36px;text-align:center;cursor:pointer;background:#fff;transition:all .13s}
.drop-zone:hover,.drop-zone.drag{border-color:#0A0A0A;background:#FAFAF8}
/* automations */
.auto-block{background:#fff;border:1px solid #EAEAE6;border-radius:12px;padding:20px 22px;margin-bottom:12px}
.auto-title{font-size:14px;font-weight:700;margin-bottom:12px}
.cl-item{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid #F5F5F1}
.cl-item:last-child{border-bottom:none}
.cl-box{width:17px;height:17px;border-radius:4px;border:2px solid #D0D0CA;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:10px;transition:all .1s;flex-shrink:0}
.cl-box.ck{background:#0A0A0A;border-color:#0A0A0A;color:#fff}
.cl-txt{font-size:13px;flex:1}
.cl-txt.done{text-decoration:line-through;color:#ADADAA}
.tpl{display:flex;gap:9px;align-items:flex-start;padding:9px;background:#FAFAF8;border-radius:8px;margin-bottom:7px;border:1px solid #F0F0EC}
.tpl-body{font-size:12.5px;color:#0A0A0A;line-height:1.55;flex:1}
.copy-btn{background:#0A0A0A;color:#fff;border:none;border-radius:6px;padding:4px 9px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0;transition:background .1s}
.copy-btn:hover{background:#2A2A2A}
.copy-btn.copied{background:#1A6A40}
/* lock */
.lock-screen{height:100vh;display:flex;align-items:center;justify-content:center;background:#F5F5F3}
.lock-card{background:#fff;border-radius:20px;padding:40px 34px;max-width:320px;width:100%;border:1px solid #EAEAE6;text-align:center;box-shadow:0 10px 36px rgba(0,0,0,.06)}
.lock-logo{font-size:22px;font-weight:800;letter-spacing:-0.4px;margin-bottom:3px}
.lock-sub{font-size:13px;color:#ADADAA;margin-bottom:26px}
.pin-dots{display:flex;justify-content:center;gap:9px;margin-bottom:20px}
.pd{width:13px;height:13px;border-radius:50%;border:2px solid #D0D0CA;background:transparent;transition:all .1s}
.pd.filled{background:#0A0A0A;border-color:#0A0A0A}
.pin-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;max-width:200px;margin:0 auto}
.pn{background:#F5F5F3;border:none;border-radius:9px;padding:14px;font-size:18px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .1s;color:#0A0A0A}
.pn:hover{background:#EBEBE9}
.pn.del{background:transparent;color:#ADADAA;font-size:13px}
.pin-err{color:#A84050;font-size:12px;margin-top:9px;min-height:16px;font-weight:600}
/* profile section */
.prof-sec{font-size:15px;font-weight:700;margin-bottom:12px;padding-bottom:7px;border-bottom:1.5px solid #EAEAE6}
/* scrollbar */
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#D4D4CE;border-radius:2px}
a.lnk{color:#8A6000;font-size:12px;font-weight:600;text-decoration:none;word-break:break-all}
a.lnk:hover{text-decoration:underline}
a.lnk-b{color:#1A5FA0;font-size:12px;font-weight:600;text-decoration:none}
a.lnk-b:hover{text-decoration:underline}
/* auth */
.auth-screen{min-height:100vh;background:#F5F5F3;display:grid;place-items:center;padding:24px}
.auth-card{width:100%;max-width:420px;background:#fff;border:1px solid #EAEAE6;border-radius:18px;padding:30px;box-shadow:0 14px 48px rgba(0,0,0,.07)}
.auth-kicker{font-size:10px;color:#ADADAA;font-weight:800;text-transform:uppercase;letter-spacing:.12em;margin-bottom:7px}
.auth-title{font-size:28px;font-weight:800;letter-spacing:-.7px;line-height:1.1;margin-bottom:8px}
.auth-sub{font-size:13px;color:#7A7A76;line-height:1.65;margin-bottom:22px}
.auth-msg{font-size:12.5px;line-height:1.55;border-radius:9px;padding:10px 12px;margin-bottom:12px;background:#FAFAF8;border:1px solid #EAEAE6;color:#6A6A66}
.auth-msg.err{background:#FEF0F2;border-color:#F5D5D8;color:#A84050}
.auth-actions{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-top:16px;flex-wrap:wrap}
.link-btn{border:none;background:transparent;color:#7A7A76;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;padding:4px 0}
.link-btn:hover{color:#0A0A0A;text-decoration:underline}
.setup-code{font-size:12px;background:#0A0A0A;color:#fff;border-radius:10px;padding:12px 14px;line-height:1.7;white-space:pre-wrap;overflow:auto;margin-top:10px}
.sb-cloud{font-size:10px;color:#ADADAA;margin-top:2px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sb-signout{margin-left:auto;background:#F5F5F3;border:1px solid #EAEAE6;color:#7A7A76;border-radius:7px;padding:5px 7px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit}
.sb-signout:hover{color:#0A0A0A;border-color:#D4D4CE}
.planner-scroll{overflow-x:auto;padding-bottom:4px}
.dashboard-grid{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:16px}
.trend-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.edit-count-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:18px}
@media (max-width:920px){
  .app{display:block;height:100dvh;overflow:hidden}
  .sb{width:100%;height:auto;max-height:164px;border-right:0;border-bottom:1px solid #EAEAE6;overflow:hidden}
  .sb-logo{padding:14px 16px 10px}
  .sb-nav{display:flex;gap:6px;overflow-x:auto;padding:8px 12px 10px;flex:none}
  .sb-sec{display:none}
  .sb-item{flex:0 0 auto;border-left:0;border-bottom:2px solid transparent;border-radius:8px;padding:8px 10px;background:#FAFAF8}
  .sb-item.on{border-left-color:transparent;border-bottom-color:#0A0A0A}
  .sb-foot{display:none}
  .main{height:calc(100dvh - 112px);overflow-y:auto}
  .page{padding:24px 16px 56px;max-width:none}
  .pg-title{font-size:25px}
  .hero{border-radius:12px;padding:22px 20px}
  .hero-h{font-size:21px}
  .hero-btns,.auth-actions,.mr,.cal-hd,.sh{align-items:flex-start;flex-wrap:wrap}
  .dashboard-grid,.trend-grid,.two-col,.three-col{grid-template-columns:1fr!important}
  .g2{grid-template-columns:minmax(0,1fr)}
  .stat-row{grid-template-columns:repeat(2,minmax(0,1fr))}
  .cal-hd .btn[style]{margin-left:0!important}
  .cal-month{min-width:0;flex:1}
  .day{min-height:54px;padding:4px}
  .planner-grid{min-width:720px}
  .edit-count-grid{grid-template-columns:repeat(2,1fr)}
  .modal{padding:22px;max-height:86vh}
  .auth-card{padding:24px 20px}
}
@media (max-width:520px){
  .stat-row{grid-template-columns:1fr}
  .btn{white-space:normal;line-height:1.2}
  .cgrid{gap:2px}
  .day{min-height:44px;border-radius:6px}
  .dn{font-size:10.5px}
  .wdr{min-width:0}
  .auth-title{font-size:24px}
}
`;

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState(INIT);
  const [loaded, setLoaded] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState(null);
  const [remoteLoaded, setRemoteLoaded] = useState(!isSupabaseConfigured);
  const [syncing, setSyncing] = useState("");
  const [syncError, setSyncError] = useState("");
  const [lastRemoteSave, setLastRemoteSave] = useState(null);
  const [modal, setModal] = useState(null);
  const [cal, setCal] = useState({ y: new Date().getFullYear(), m: new Date().getMonth() });
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");
  const [pinSetup, setPinSetup] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = localStorage.getItem("chub_v3");
        if (r) {
          const saved = JSON.parse(r);
          setData(mergeData(saved));
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true);
      return;
    }

    let alive = true;
    supabase.auth.getSession().then(({ data: authData }) => {
      if (!alive) return;
      setSession(authData.session || null);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setAuthReady(true);
      if (!nextSession) {
        setRemoteLoaded(false);
        setSyncing("");
        setSyncError("");
        setData(INIT);
      }
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady || !isSupabaseConfigured || !session?.user) return;

    let ignore = false;
    setRemoteLoaded(false);
    setSyncing("Carregando nuvem...");
    setSyncError("");

    (async () => {
      const { data: row, error } = await supabase
        .from("creator_hub_data")
        .select("data")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (ignore) return;
      if (error) {
        setSyncError("Não consegui carregar seus dados na nuvem. O app continua funcionando neste aparelho.");
      } else if (row?.data) {
        setData(mergeData(row.data));
      }
      setRemoteLoaded(true);
      setSyncing("");
    })();

    return () => { ignore = true; };
  }, [authReady, session?.user?.id]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("chub_v3", JSON.stringify(data)); } catch {}

    if (!isSupabaseConfigured || !session?.user || !remoteLoaded) return;

    window.clearTimeout(saveTimer.current);
    setSyncing("Salvando...");
    saveTimer.current = window.setTimeout(async () => {
      const { error } = await supabase
        .from("creator_hub_data")
        .upsert({
          user_id: session.user.id,
          data,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) {
        setSyncError("Não consegui salvar na nuvem agora. Vou tentar de novo na próxima alteração.");
      } else {
        setSyncError("");
        setLastRemoteSave(new Date());
      }
      setSyncing("");
    }, 650);

    return () => window.clearTimeout(saveTimer.current);
  }, [data, loaded, session?.user?.id, remoteLoaded]);

  useEffect(() => {
    if (loaded && data.pinEnabled && data.pin) setLocked(true);
  }, [loaded]);

  const upd = (k, v) => setData(d => ({ ...d, [k]: v }));
  const add = (k, item) => setData(d => ({ ...d, [k]: [item, ...d[k]] }));
  const rem = (k, id) => setData(d => ({ ...d, [k]: d[k].filter(x => x.id !== id) }));
  const updi = (k, id, patch) => setData(d => ({ ...d, [k]: d[k].map(x => x.id === id ? { ...x, ...patch } : x) }));
  const updiGravar = (id, patch) => setData(d => {
    const current = d.gravar.find(x => x.id === id);
    if (!current) return d;

    const updated = { ...current, ...patch };
    const shouldSendToEdit = current.status !== "Gravado" && updated.status === "Gravado";
    const alreadySent = d.editar.some(x => x.sourceGravarId === id);
    const nextGravar = d.gravar.map(x => x.id === id ? updated : x);

    if (!shouldSendToEdit || alreadySent) return { ...d, gravar: nextGravar };

    const inspoLinks = (updated.inspoLinks || []).filter(l => l.trim());
    const nextEditar = {
      id: uid(),
      sourceGravarId: id,
      title: updated.title,
      cat: updated.cat,
      inspoLinks,
      inspoUrl: inspoLinks[0] || "",
      notes: "",
      status: "Para editar",
      prazo: "",
      checklist: [],
      checklistRaw: "",
      createdAt: todayStr(),
    };

    return { ...d, gravar: nextGravar, editar: [nextEditar, ...d.editar] };
  });
  const closeModal = () => setModal(null);

  const handlePin = digit => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      if (pinSetup) {
        upd("pin", next); upd("pinEnabled", true);
        setPin(""); setPinSetup(false); setPinErr("");
        alert("PIN configurado!");
      } else {
        if (next === data.pin) { setLocked(false); setPin(""); }
        else { setPinErr("PIN incorreto."); setTimeout(() => { setPin(""); setPinErr(""); }, 700); }
      }
    }
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setData(INIT);
  };

  const ctx = {
    data, upd, add, rem, updi, updiGravar, modal, setModal, closeModal, cal, setCal,
    auth: {
      session,
      email: session?.user?.email || "",
      configured: isSupabaseConfigured,
      syncing,
      syncError,
      lastRemoteSave,
      signOut: handleSignOut,
    },
  };

  if (!loaded || !authReady || (isSupabaseConfigured && session?.user && !remoteLoaded)) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#AAA", fontSize: 13 }}>carregando...</div>;

  if (isSupabaseConfigured && !session) return (
    <>
      <style>{CSS}</style>
      <AuthScreen />
    </>
  );

  if (locked) return (
    <>
      <style>{CSS}</style>
      <div className="lock-screen">
        <div className="lock-card">
          <div className="lock-logo">creator hub</div>
          <div className="lock-sub">Digite seu PIN</div>
          <div className="pin-dots">{[0,1,2,3].map(i => <div key={i} className={`pd${pin.length > i ? " filled" : ""}`} />)}</div>
          <div className="pin-pad">
            {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} className="pn" onClick={() => handlePin(String(n))}>{n}</button>)}
            <div /><button className="pn" onClick={() => handlePin("0")}>0</button>
            <button className="pn del" onClick={() => setPin(p => p.slice(0,-1))}>⌫</button>
          </div>
          <div className="pin-err">{pinErr}</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <aside className="sb">
          <div className="sb-logo">
            <div className="sb-brand">creator hub</div>
            <div className="sb-tag">creator operating system</div>
          </div>
          <nav className="sb-nav">
            {NAV_ITEMS.map((n, i) => n.sec
              ? <div key={i} className="sb-sec">{n.sec}</div>
              : <div key={n.id} className={`sb-item${page === n.id ? " on" : ""}`} onClick={() => setPage(n.id)}>
                  <span className="sb-ico">{n.ico}</span>{n.label}
                </div>
            )}
          </nav>
          <div className="sb-foot">
            <div className="sb-av">{(data.profile.name || "C").slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="sb-fn">{data.profile.name || "Sua conta"}</div>
              <div className="sb-fh">{data.profile.handle || "@handle"}</div>
              {isSupabaseConfigured && <div className="sb-cloud">{syncError ? "nuvem pausada" : syncing || "nuvem ativa"}</div>}
            </div>
            {isSupabaseConfigured && <button className="sb-signout" onClick={handleSignOut} title="Sair">Sair</button>}
          </div>
        </aside>
        <main className="main">
          {page === "dashboard"   && <PageDashboard ctx={ctx} />}
          {page === "calendar"    && <PageCalendar ctx={ctx} />}
          {page === "planner"     && <PagePlanner ctx={ctx} />}
          {page === "ideas"       && <PageIdeas ctx={ctx} />}
          {page === "hooks"       && <PageHooks ctx={ctx} />}
          {page === "roteiros"    && <PageRoteiros ctx={ctx} />}
          {page === "gravar"      && <PageGravar ctx={ctx} />}
          {page === "editar"      && <PageEditar ctx={ctx} />}
          {page === "media"       && <PageMedia ctx={ctx} />}
          {page === "brands"      && <PageBrands ctx={ctx} />}
          {page === "crm"         && <PageCRM ctx={ctx} />}
          {page === "platforms"   && <PagePlatforms ctx={ctx} />}
          {page === "tendencias"  && <PageTendencias ctx={ctx} />}
          {page === "sitesdiarios"&& <PageSitesDiarios ctx={ctx} />}
          {page === "creators"    && <PageCreators ctx={ctx} />}
          {page === "ugc"         && <PageUGC ctx={ctx} />}
          {page === "profile"     && <PageProfile ctx={ctx} onSetPin={() => { setPinSetup(true); }} />}
          {page === "automations" && <PageAutomations ctx={ctx} />}
        </main>
      </div>
      {modal && <Modals ctx={ctx} />}
    </>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isSignup = mode === "signup";
  const isReset = mode === "reset";

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const cleanEmail = email.trim();
    const redirectUrl = authRedirectUrl();
    let result;
    if (isReset) {
      result = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });
    } else if (isSignup) {
      result = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
    } else {
      result = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    }

    if (result.error) {
      setError(result.error.message);
    } else if (isReset) {
      setMessage("Enviei o link de recuperação para o seu email.");
    } else if (isSignup && !result.data.session) {
      setMessage("Cadastro criado. Confirme seu email para entrar.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-kicker">creator hub</div>
        <div className="auth-title">{isReset ? "Recuperar acesso" : isSignup ? "Criar sua conta" : "Entrar no hub"}</div>
        <div className="auth-sub">
          {isReset
            ? "Digite seu email para receber um link de recuperação."
            : "Seu planejamento, CRM e calendário ficam salvos na sua conta Supabase."}
        </div>

        {message && <div className="auth-msg">{message}</div>}
        {error && <div className="auth-msg err">{error}</div>}

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" required autoFocus />
        </div>
        {!isReset && (
          <div className="field">
            <label>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" minLength={6} required />
          </div>
        )}

        <button className="btn btn-k" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", opacity: loading ? .65 : 1 }}>
          {loading ? "Aguarde..." : isReset ? "Enviar link" : isSignup ? "Criar conta" : "Entrar"}
        </button>

        <div className="auth-actions">
          <button type="button" className="link-btn" onClick={() => { setMode(isSignup ? "login" : "signup"); setError(""); setMessage(""); }}>
            {isSignup ? "Já tenho conta" : "Criar conta"}
          </button>
          <button type="button" className="link-btn" onClick={() => { setMode(isReset ? "login" : "reset"); setError(""); setMessage(""); }}>
            {isReset ? "Voltar ao login" : "Esqueci minha senha"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── DASHBOARD ─── */
function PageDashboard({ ctx }) {
  const { data, setModal } = ctx;
  const today = todayStr();
  const todayPosts = data.calendar.filter(p => p.date === today);
  const upcoming = data.calendar.filter(p => p.date >= today && p.status !== "Publicado").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const pr = data.profile;
  return (
    <div className="page">
      <div className="pg-welcome">welcome back</div>
      <div className="pg-title">{pr.name ? `Olá, ${pr.name.split(" ")[0]} ✦` : "Seu Creator Dashboard"}</div>
      <div className="pg-sub">Gerencie seu conteúdo, parcerias e crescimento em um lugar só.</div>

      <div className="hero">
        <div className="hero-tag">creator mode ativado</div>
        <div className="hero-h">Construa sua carreira com sistemas, estratégia e organização.</div>
        <div className="hero-s">Seu hub completo para crescer no Instagram com consistência e intenção.</div>
        <div className="hero-btns">
          <button className="btn btn-w btn-sm" onClick={() => setModal({ type: "post", data: { date: today } })}>+ Agendar post ↗</button>
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={() => setModal({ type: "idea", data: null })}>+ Nova ideia</button>
        </div>
      </div>

      <div className="stat-row">
        <div className="sc"><div className="sc-n">{data.ideas.filter(i => !i.done).length}</div><div className="sc-l">Ideias pendentes</div></div>
        <div className="sc"><div className="sc-n">{data.gravar.filter(i => i.status === "Para gravar").length}</div><div className="sc-l">Para gravar</div></div>
        <div className="sc"><div className="sc-n">{data.editar.filter(i => i.status === "Para editar").length}</div><div className="sc-l">Para editar</div></div>
        <div className="sc"><div className="sc-n">{data.calendar.filter(p => p.status === "Publicado").length}</div><div className="sc-l">Publicados</div></div>
        <div className="sc"><div className="sc-n">{data.brands.length + data.crm.length}</div><div className="sc-l">Marcas</div></div>
        <div className="sc"><div className="sc-n">{data.hooks.length}</div><div className="sc-l">Hooks</div></div>
        <div className="sc"><div className="sc-n">{data.roteiros.length}</div><div className="sc-l">Roteiros</div></div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="sh"><div className="st">Hoje — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</div>
            <button className="btn btn-o btn-sm" onClick={() => setModal({ type: "post", data: { date: today } })}>+ Post</button></div>
          {todayPosts.length === 0
            ? <div style={{ background: "#fff", border: "2px dashed #DDDDD8", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#ADADAA" }}>Nenhum post hoje.</div>
            : todayPosts.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#fff", borderRadius: 9, border: "1px solid #EAEAE6", marginBottom: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: postColor(p.type), flexShrink: 0 }} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div><div style={{ fontSize: 11, color: "#ADADAA" }}>{p.type}</div></div>
                <span className={`badge ${p.status === "Publicado" ? "bgreen" : p.status === "Planejado" ? "bamber" : "bgray"}`}>{p.status}</span>
              </div>
            ))}
          <div className="dv" />
          <div className="sh"><div className="st">Próximos posts</div></div>
          {upcoming.length === 0
            ? <div className="empty"><div className="empty-ico">📅</div><div className="empty-t">Nenhum post agendado</div></div>
            : upcoming.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 13px", background: "#fff", borderRadius: 8, border: "1px solid #EAEAE6", marginBottom: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: postColor(p.type), flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: "#ADADAA" }}>{new Date(p.date + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} · {p.type}</div>
              </div>
            ))}
        </div>
        <div>
          <div className="sh"><div className="st">Perfil</div></div>
          <div className="card cp" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "#ADADAA", marginBottom: 3 }}>creator profile</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 5 }}>{pr.name || "Seu nome"}</div>
            <div style={{ fontSize: 10, color: "#ADADAA", marginBottom: 1 }}>nicho</div>
            <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 8 }}>{pr.niche || "Beleza · Lifestyle"}</div>
            {pr.bio && <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.6 }}>{pr.bio}</div>}
            {(pr.followers || pr.engagement) && (
              <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                {pr.followers && <div><div style={{ fontSize: 18, fontWeight: 800 }}>{pr.followers}</div><div style={{ fontSize: 9.5, color: "#ADADAA" }}>seguidores</div></div>}
                {pr.engagement && <div><div style={{ fontSize: 18, fontWeight: 800 }}>{pr.engagement}</div><div style={{ fontSize: 9.5, color: "#ADADAA" }}>engajamento</div></div>}
              </div>
            )}
          </div>
          <div className="sh"><div className="st">Ideias recentes</div></div>
          {data.ideas.filter(i => !i.done).slice(0, 4).map(i => (
            <div key={i.id} style={{ padding: "9px 13px", background: "#fff", borderRadius: 8, border: "1px solid #EAEAE6", marginBottom: 6 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>{i.title}</div>
              <span className={`badge ${i.cat === "Beleza" || i.cat === "Moda" ? "brose" : i.cat === "Lifestyle" ? "bamber" : i.cat === "UGC" ? "bblue" : i.cat === "Motivacional" ? "bpurple" : "bgray"}`}>{i.cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CALENDAR ─── */
function PageCalendar({ ctx }) {
  const { data, setModal, cal, setCal, rem, updi } = ctx;
  const { y, m } = cal;
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ d: new Date(y, m - 1, prevDays - i), cur: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ d: new Date(y, m, i), cur: true });
  while (cells.length < 42) cells.push({ d: new Date(y, m + 1, cells.length - firstDay - daysInMonth + 1), cur: false });
  const ds = d => d.toISOString().slice(0, 10);
  const today = todayStr();
  const list = data.calendar.filter(p => p.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="page">
      <div className="pg-title">Content Calendar</div>
      <div className="pg-sub">Planeje e acompanhe todos os seus posts</div>
      <div className="cal-hd">
        <button className="btn btn-o btn-sm" onClick={() => setCal(c => { const d = new Date(c.y, c.m - 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>‹</button>
        <div className="cal-month">{MONTHS[m]} {y}</div>
        <button className="btn btn-o btn-sm" onClick={() => setCal(c => { const d = new Date(c.y, c.m + 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>›</button>
        <button className="btn btn-k btn-sm" style={{ marginLeft: "auto" }} onClick={() => setModal({ type: "post", data: { date: today } })}>+ Novo post</button>
      </div>
      <div className="card" style={{ padding: "10px", marginBottom: 18 }}>
        <div className="wdr">{WDAYS.map(w => <div key={w} className="wd">{w}</div>)}</div>
        <div className="cgrid">
          {cells.map((cell, i) => {
            const posts = data.calendar.filter(p => p.date === ds(cell.d));
            return (
              <div key={i} className={`day${!cell.cur ? " other" : ""}${ds(cell.d) === today ? " today" : ""}`} onClick={() => cell.cur && setModal({ type: "calDay", data: ds(cell.d) })}>
                <div className="dn">{cell.d.getDate()}</div>
                <div>{posts.slice(0, 4).map(p => <span key={p.id} className="pdot" style={{ background: postColor(p.type) }} title={p.title} />)}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="sh"><div className="st">Próximos posts agendados</div></div>
      {list.length === 0
        ? <div className="empty"><div className="empty-ico">📅</div><div className="empty-t">Nenhum post agendado</div></div>
        : list.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#fff", borderRadius: 9, border: "1px solid #EAEAE6", marginBottom: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: postColor(p.type), flexShrink: 0 }} />
            <div style={{ minWidth: 42, fontSize: 11, color: "#ADADAA", fontWeight: 600 }}>{new Date(p.date + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.title}</div>
            <span style={{ fontSize: 12, color: "#ADADAA" }}>{p.type}</span>
            <select value={p.status} onChange={e => updi("calendar", p.id, { status: e.target.value })} style={{ width: "auto", fontSize: 11, padding: "3px 6px" }}>{POST_STATUS.map(s => <option key={s}>{s}</option>)}</select>
            <button className="btn btn-r btn-xs" onClick={() => rem("calendar", p.id)}>✕</button>
          </div>
        ))}
    </div>
  );
}

/* ─── PLANNER ─── */
function PagePlanner({ ctx }) {
  const { data, upd } = ctx;
  const [weekOff, setWeekOff] = useState(0);
  const [addingCell, setAddingCell] = useState(null);
  const [addText, setAddText] = useState("");
  const getMonday = off => {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff + off * 7); return d;
  };
  const monday = getMonday(weekOff);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const ds = d => d.toISOString().slice(0, 10);
  const today = todayStr();
  const getTasks = (date, period) => data.planner[date + "_" + period] || [];
  const addTask = (date, period, text) => {
    if (!text.trim()) return;
    const key = date + "_" + period;
    upd("planner", { ...data.planner, [key]: [...getTasks(date, period), { id: uid(), text, done: false }] });
  };
  const toggleTask = (date, period, tid) => {
    const key = date + "_" + period;
    upd("planner", { ...data.planner, [key]: getTasks(date, period).map(t => t.id === tid ? { ...t, done: !t.done } : t) });
  };
  const delTask = (date, period, tid) => {
    const key = date + "_" + period;
    upd("planner", { ...data.planner, [key]: getTasks(date, period).filter(t => t.id !== tid) });
  };
  return (
    <div className="page">
      <div className="pg-title">Planner Semanal</div>
      <div className="pg-sub">Organize sua semana por período do dia</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className="btn btn-o btn-sm" onClick={() => setWeekOff(w => w - 1)}>‹ Anterior</button>
        <button className="btn btn-o btn-sm" onClick={() => setWeekOff(0)}>Hoje</button>
        <button className="btn btn-o btn-sm" onClick={() => setWeekOff(w => w + 1)}>Próxima ›</button>
      </div>
      <div className="planner-scroll">
      <div className="planner-grid">
        <div className="pl-hd" style={{ background: "#fff", borderBottom: "2px solid #0A0A0A" }} />
        {days.map(d => (
          <div key={ds(d)} className="pl-hd" style={{ background: ds(d) === today ? "#F8F8F5" : "#FAFAF8" }}>
            <div style={{ fontSize: 9.5, color: "#ADADAA", marginBottom: 1 }}>{WDAYS[d.getDay()]}</div>
            <div style={{ fontSize: 14, fontWeight: ds(d) === today ? 800 : 600, color: ds(d) === today ? "#0A0A0A" : "#7A7A76" }}>{d.getDate()}</div>
          </div>
        ))}
        {PERIODS.map(period => (
          <>
            <div key={period + "_l"} className="pl-period">{period}</div>
            {days.map(d => {
              const date = ds(d); const key = date + "_" + period;
              const tasks = getTasks(date, period);
              const isAdding = addingCell === key;
              return (
                <div key={date + period} className="pl-cell" style={{ borderBottom: period === "Noite" ? "none" : undefined }}>
                  {tasks.map(t => (
                    <div key={t.id} className={`pl-task${t.done ? " done" : ""}`} onClick={() => toggleTask(date, period, t.id)}>
                      <span style={{ flex: 1 }}>{t.text}</span>
                      <span onClick={e => { e.stopPropagation(); delTask(date, period, t.id); }} style={{ color: "#ADADAA", fontWeight: 800, lineHeight: 1 }}>×</span>
                    </div>
                  ))}
                  {isAdding
                    ? <input autoFocus value={addText} onChange={e => setAddText(e.target.value)} style={{ fontSize: 11, padding: "3px 6px", borderRadius: 5, width: "100%" }}
                        onKeyDown={e => { if (e.key === "Enter") { addTask(date, period, addText); setAddText(""); setAddingCell(null); } if (e.key === "Escape") { setAddingCell(null); setAddText(""); } }}
                        onBlur={() => { addTask(date, period, addText); setAddText(""); setAddingCell(null); }} />
                    : <div className="pl-add" onClick={() => setAddingCell(key)}>+ add</div>}
                </div>
              );
            })}
          </>
        ))}
      </div>
      </div>
    </div>
  );
}

/* ─── IDEAS ─── */
function PageIdeas({ ctx }) {
  const { data, rem, updi, setModal } = ctx;
  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? data.ideas : data.ideas.filter(i => i.cat === filter);
  const cc = c => ({ Beleza: "brose", Skincare: "bpurple", Lifestyle: "bamber", Motivacional: "bpurple", UGC: "bblue", Moda: "brose", Outro: "bgray" })[c] || "bgray";
  return (
    <div className="page">
      <div className="pg-title">Banco de Ideias</div>
      <div className="pg-sub">Capture inspirações antes que passem</div>
      <div className="sh">
        <div className="fr">{IDEA_CATS.map(c => <button key={c} className={`fb${filter === c ? " on" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}</div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "idea", data: null })}>+ Ideia</button>
      </div>
      <div style={{ height: 13 }} />
      {filtered.length === 0
        ? <div className="empty"><div className="empty-ico">💡</div><div className="empty-t">Nenhuma ideia ainda. Anote a próxima!</div></div>
        : <div className="g2">
          {filtered.map(i => (
            <div key={i.id} className="card cp" style={{ opacity: i.done ? .52 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 7, marginBottom: 6 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{i.title}</div>
                <button className="btn btn-r btn-xs" onClick={() => rem("ideas", i.id)}>✕</button>
              </div>
              {i.content && <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.6, marginBottom: 9 }}>{i.content}</div>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className={`badge ${cc(i.cat)}`}>{i.cat}</span>
                <button className="btn btn-o btn-xs" onClick={() => updi("ideas", i.id, { done: !i.done })}>{i.done ? "↩ Reativar" : "✓ Usada"}</button>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ─── HOOKS ─── */
function PageHooks({ ctx }) {
  const { data, rem, setModal } = ctx;
  const [filter, setFilter] = useState("Todos");
  const [copied, setCopied] = useState(null);
  const filtered = filter === "Todos" ? data.hooks : data.hooks.filter(h => h.cat === filter);
  const copy = (id, text) => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(id); setTimeout(() => setCopied(null), 1400); };
  const cc = c => ({ Pergunta: "bblue", Choque: "brose", Promessa: "bgreen", História: "bamber", Polêmica: "bpurple", Curiosidade: "bgray" })[c] || "bgray";
  return (
    <div className="page">
      <div className="pg-title">Hooks Virais</div>
      <div className="pg-sub">Frases que prendem a atenção nos primeiros 3 segundos</div>
      <div className="sh">
        <div className="fr">{HOOK_CATS.map(c => <button key={c} className={`fb${filter === c ? " on" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}</div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "hook", data: null })}>+ Hook</button>
      </div>
      <div style={{ height: 13 }} />
      {filtered.length === 0
        ? <div className="empty"><div className="empty-ico">◆</div><div className="empty-t">Nenhum hook aqui</div></div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {filtered.map(h => (
            <div key={h.id} className="hk-card">
              <div className="hk-text">"{h.text}"</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span className={`badge ${cc(h.cat)}`}>{h.cat}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button className={`copy-btn${copied === h.id ? " copied" : ""}`} onClick={() => copy(h.id, h.text)}>{copied === h.id ? "✓ Copiado" : "Copiar"}</button>
                  <button className="btn btn-r btn-xs" onClick={() => rem("hooks", h.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ─── ROTEIROS ─── */
function PageRoteiros({ ctx }) {
  const { data, rem, setModal } = ctx;
  return (
    <div className="page">
      <div className="pg-title">Roteiros</div>
      <div className="pg-sub">Scripts estruturados para seus vídeos</div>
      <div className="sh"><div className="st">{data.roteiros.length} roteiro{data.roteiros.length !== 1 ? "s" : ""}</div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "roteiro", data: null })}>+ Roteiro</button></div>
      {data.roteiros.length === 0
        ? <div className="empty"><div className="empty-ico">📝</div><div className="empty-t">Escreva o script do próximo Reel!</div></div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {data.roteiros.map(r => (
            <div key={r.id} className="card cp">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>{r.title}</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <span className={`badge ${r.type === "Reels" ? "brose" : r.type === "TikTok" ? "bpurple" : "bamber"}`}>{r.type}</span>
                    <span className="badge bgray">{r.duration || "30s"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="btn btn-o btn-xs" onClick={() => ctx.setModal({ type: "roteiro", data: r })}>editar</button>
                  <button className="btn btn-r btn-xs" onClick={() => rem("roteiros", r.id)}>✕</button>
                </div>
              </div>
              {r.hook && <div style={{ fontSize: 12.5, background: "#FFF3DC", color: "#8A5500", borderRadius: 7, padding: "7px 11px", marginBottom: 8 }}><strong>HOOK — </strong>{r.hook}</div>}
              {r.body && <div style={{ fontSize: 12.5, color: "#6A6A66", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{r.body}</div>}
              {r.cta && <div style={{ fontSize: 12.5, background: "#E4F5EC", color: "#1A6A40", borderRadius: 7, padding: "7px 11px", marginTop: 8 }}><strong>CTA — </strong>{r.cta}</div>}
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ─── PARA GRAVAR ─── */
function PageGravar({ ctx }) {
  const { data, rem, updiGravar, setModal } = ctx;
  const [filter, setFilter] = useState("Todos");
  const [sfilter, setSfilter] = useState("Todos");
  const [expandedRoteiros, setExpandedRoteiros] = useState({});
  const items = data.gravar.filter(i =>
    (filter === "Todos" || i.cat === filter) &&
    (sfilter === "Todos" || i.status === sfilter)
  );
  const statusColor = s => ({ "Para gravar": "#FF6B6B", "Gravado": "#55D496", "Descartado": "#ADADAA" })[s] || "#ADADAA";
  const statusBadge = s => ({ "Para gravar": "brose", "Gravado": "bgreen", "Descartado": "bgray" })[s] || "bgray";
  const catBadge = c => ({ Reels: "brose", Carrossel: "bamber", Stories: "bblue", TikTok: "bpurple", UGC: "bblue", Outro: "bgray" })[c] || "bgray";

  return (
    <div className="page">
      <div className="pg-title">Para Gravar</div>
      <div className="pg-sub">Conteúdos prontos para entrar na frente da câmera</div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <div className="fr">{GRAVAR_CATS.map(c => <button key={c} className={`fb${filter === c ? " on" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}</div>
        </div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "gravar", data: null })}>+ Adicionar</button>
      </div>

      <div className="fr" style={{ marginBottom: 14 }}>
        {["Todos", ...GRAVAR_STATUS].map(s => (
          <button key={s} className={`fb${sfilter === s ? " on" : ""}`} onClick={() => setSfilter(s)}
            style={sfilter !== s && s !== "Todos" ? { borderColor: statusColor(s), color: statusColor(s) } : {}}>
            {s !== "Todos" && <span className="status-dot" style={{ background: statusColor(s), marginRight: 5 }} />}{s}
          </button>
        ))}
      </div>

      {items.length === 0
        ? <div className="empty"><div className="empty-ico">🎬</div><div className="empty-t">Nenhum conteúdo aqui ainda.<br />Adicione o que você quer gravar!</div></div>
        : <div className="g2">
          {items.map(item => {
            const linkedRoteiro = data.roteiros.find(r => r.id === item.roteiroId);
            const fullRoteiroText = linkedRoteiro ? roteiroText(linkedRoteiro) : "";
            const isRoteiroExpanded = !!expandedRoteiros[item.id];
            const shouldCollapseRoteiro = fullRoteiroText.length > 220 || fullRoteiroText.split("\n").length > 4;
            const visibleRoteiroText = !shouldCollapseRoteiro || isRoteiroExpanded ? fullRoteiroText : `${fullRoteiroText.slice(0, 220).trim()}...`;
            return (
            <div key={item.id} className="gc">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="status-dot" style={{ background: statusColor(item.status) }} />
                  <div className="gc-title" style={{ margin: 0 }}>{item.title}</div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="btn btn-o btn-xs" onClick={() => setModal({ type: "gravar", data: item })}>editar</button>
                  <button className="btn btn-r btn-xs" onClick={() => rem("gravar", item.id)}>✕</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 5, marginBottom: 9, flexWrap: "wrap" }}>
                <span className={`badge ${catBadge(item.cat)}`}>{item.cat}</span>
                <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                {item.priority === "Alta" && <span className="badge brose">🔥 Alta prioridade</span>}
              </div>

              {item.roteiroId && (
                <div style={{ fontSize: 12, background: "#F8FBFF", border: "1px solid #DCEBFF", borderRadius: 7, padding: "9px 11px", marginBottom: 9, color: "#3A5268", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#5D85AA", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Roteiro relacionado</div>
                  {linkedRoteiro ? (
                    <>
                      <div style={{ fontWeight: 700, marginBottom: 5 }}>{linkedRoteiro.title}</div>
                      <div>{visibleRoteiroText || "Esse roteiro ainda não tem texto preenchido."}</div>
                      {shouldCollapseRoteiro && (
                        <button
                          className="btn btn-o btn-xs"
                          onClick={() => setExpandedRoteiros(p => ({ ...p, [item.id]: !p[item.id] }))}
                          style={{ marginTop: 8 }}
                        >
                          {isRoteiroExpanded ? "ver menos" : "ver completo"}
                        </button>
                      )}
                    </>
                  ) : "Roteiro não encontrado"}
                </div>
              )}

              {item.inspoLinks && item.inspoLinks.filter(l=>l).length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#ADADAA", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Inspirações</div>
                  {item.inspoLinks.filter(l=>l).map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noreferrer" className="lnk" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, marginBottom: 3 }}>
                      ↗ Link {i + 1}
                    </a>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", borderTop: "1px solid #EAEAE6", paddingTop: 9, marginTop: 2 }}>
                {GRAVAR_STATUS.filter(s => s !== item.status).map(s => (
                  <button key={s} className="btn btn-o btn-xs" onClick={() => updiGravar(item.id, { status: s })}>{s}</button>
                ))}
              </div>
            </div>
          )})}
        </div>}
    </div>
  );
}

/* ─── PARA EDITAR ─── */
function PageEditar({ ctx }) {
  const { data, rem, updi, setModal } = ctx;
  const [filter, setFilter] = useState("Todos");
  const [sfilter, setSfilter] = useState("Todos");
  const items = data.editar.filter(i =>
    (filter === "Todos" || i.cat === filter) &&
    (sfilter === "Todos" || i.status === sfilter)
  );
  const statusColor = s => ({ "Para editar": "#FFB347", "Editando": "#74B9FF", "Pronto": "#55D496", "Publicado": "#A29BFE" })[s] || "#ADADAA";
  const statusBadge = s => ({ "Para editar": "bamber", "Editando": "bblue", "Pronto": "bgreen", "Publicado": "bpurple" })[s] || "bgray";
  const catBadge = c => ({ Reels: "brose", Carrossel: "bamber", Stories: "bblue", TikTok: "bpurple", UGC: "bblue", Outro: "bgray" })[c] || "bgray";

  return (
    <div className="page">
      <div className="pg-title">Para Editar</div>
      <div className="pg-sub">Conteúdos gravados aguardando edição ou já em processo</div>

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap" }}>
        <div className="fr">{EDITAR_CATS.map(c => <button key={c} className={`fb${filter === c ? " on" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}</div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "editar", data: null })}>+ Adicionar</button>
      </div>

      <div className="fr" style={{ marginBottom: 14 }}>
        {["Todos", ...EDITAR_STATUS].map(s => (
          <button key={s} className={`fb${sfilter === s ? " on" : ""}`} onClick={() => setSfilter(s)}
            style={sfilter !== s && s !== "Todos" ? { borderColor: statusColor(s), color: statusColor(s) } : {}}>
            {s !== "Todos" && <span className="status-dot" style={{ background: statusColor(s), marginRight: 5 }} />}{s}
          </button>
        ))}
      </div>

      {/* kanban-style count row */}
      <div className="edit-count-grid">
        {EDITAR_STATUS.map(s => {
          const count = data.editar.filter(i => i.status === s).length;
          return (
            <div key={s} style={{ background: "#fff", border: "1px solid #EAEAE6", borderRadius: 9, padding: "10px 12px", borderTop: `3px solid ${statusColor(s)}` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0A0A0A" }}>{count}</div>
              <div style={{ fontSize: 10.5, color: "#ADADAA", marginTop: 2 }}>{s}</div>
            </div>
          );
        })}
      </div>

      {items.length === 0
        ? <div className="empty"><div className="empty-ico">✂️</div><div className="empty-t">Nenhum conteúdo para editar ainda.<br />Adicione vídeos gravados que precisam de edição!</div></div>
        : <div className="g2">
          {items.map(item => {
            const inspoLinks = item.inspoLinks?.length ? item.inspoLinks : item.inspoUrl ? [item.inspoUrl] : [];
            return (
            <div key={item.id} className="gc">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="status-dot" style={{ background: statusColor(item.status) }} />
                  <div className="gc-title" style={{ margin: 0 }}>{item.title}</div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="btn btn-o btn-xs" onClick={() => setModal({ type: "editar", data: item })}>editar</button>
                  <button className="btn btn-r btn-xs" onClick={() => rem("editar", item.id)}>✕</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 5, marginBottom: 9, flexWrap: "wrap" }}>
                <span className={`badge ${catBadge(item.cat)}`}>{item.cat}</span>
                <span className={`badge ${statusBadge(item.status)}`}>{item.status}</span>
                {item.prazo && <span className="badge bgray">📅 {new Date(item.prazo + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>}
              </div>

              {item.notes && (
                <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.6, marginBottom: 9 }}>{item.notes}</div>
              )}

              {inspoLinks.length > 0 && (
                <div style={{ marginBottom: 9 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#ADADAA", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Referências de edição</div>
                  {inspoLinks.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noreferrer" className="lnk" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, marginBottom: 3 }}>
                      ↗ Link {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {item.checklist && item.checklist.length > 0 && (
                <div style={{ fontSize: 11.5, color: "#6A6A66", background: "#FAFAF8", borderRadius: 7, padding: "8px 11px", marginBottom: 9 }}>
                  {item.checklist.map((c, i) => <div key={i} style={{ marginBottom: 2 }}>{'✓ '}{c}</div>)}
                </div>
              )}

              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", borderTop: "1px solid #EAEAE6", paddingTop: 9 }}>
                {EDITAR_STATUS.filter(s => s !== item.status).map(s => (
                  <button key={s} className="btn btn-o btn-xs" onClick={() => updi("editar", item.id, { status: s })}>{s}</button>
                ))}
              </div>
            </div>
          )})}
        </div>}
    </div>
  );
}

/* ─── MEDIA ─── */
function PageMedia({ ctx }) {
  const { data, rem, upd } = ctx;
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef();
  const handleFiles = files => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => upd("media", [{ id: uid(), url: e.target.result, name: file.name, date: todayStr() }, ...data.media]);
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="page">
      <div className="pg-title">Upload de Mídia</div>
      <div className="pg-sub">Galeria de referências e assets de conteúdo</div>
      <div className={`drop-zone${drag ? " drag" : ""}`} style={{ marginBottom: 18 }}
        onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
        <div style={{ fontSize: 13, color: "#7A7A76", lineHeight: 1.6 }}><strong>Clique ou arraste arquivos aqui</strong><br />Imagens JPG, PNG, WebP</div>
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>
      {data.media.length === 0
        ? <div className="empty"><div className="empty-ico">🖼️</div><div className="empty-t">Nenhuma mídia ainda</div></div>
        : <>
          <div className="sh"><div className="st">{data.media.length} arquivo{data.media.length !== 1 ? "s" : ""}</div></div>
          <div className="mgrid">
            {data.media.map(m => (
              <div key={m.id} className="mitem" onClick={() => setPreview(m)}>
                <img src={m.url} alt={m.name} className="mimg" />
                <div className="mov"><button onClick={e => { e.stopPropagation(); rem("media", m.id); }} style={{ background: "rgba(168,40,50,.9)", color: "#fff", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer", fontSize: 11, fontFamily: "inherit", fontWeight: 700 }}>Remover</button></div>
              </div>
            ))}
          </div>
        </>}
      {preview && (
        <div className="ov" onClick={() => setPreview(null)}>
          <div style={{ maxWidth: 580, width: "100%", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 16px 50px rgba(0,0,0,.15)" }}>
            <img src={preview.url} alt={preview.name} style={{ width: "100%", maxHeight: "68vh", objectFit: "contain" }} />
            <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{preview.name}</div>
              <button className="btn btn-o btn-sm" onClick={() => setPreview(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── BRANDS ─── */
function PageBrands({ ctx }) {
  const { data, rem, updi, setModal } = ctx;
  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? data.brands : data.brands.filter(b => b.status === filter);
  const sb = s => ({ "Quero muito": "brose", Contatada: "bblue", Negociando: "bamber", Fechada: "bgreen", Descartada: "bgray" })[s] || "bgray";
  return (
    <div className="page">
      <div className="pg-title">Marcas dos Sonhos</div>
      <div className="pg-sub">As marcas que você quer conquistar</div>
      <div className="sh">
        <div className="fr">{["Todos", ...BRAND_DREAM_STATUS].map(s => <button key={s} className={`fb${filter === s ? " on" : ""}`} onClick={() => setFilter(s)}>{s}</button>)}</div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "brand", data: null })}>+ Marca</button>
      </div>
      <div style={{ height: 13 }} />
      {filtered.length === 0
        ? <div className="empty"><div className="empty-ico">♡</div><div className="empty-t">Salve as marcas que você quer conquistar!</div></div>
        : <div className="g2">
          {filtered.map(b => (
            <div key={b.id} className="card cp">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 7, marginBottom: 8 }}>
                <div><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{b.name}</div><span className={`badge ${sb(b.status)}`}>{b.status}</span></div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="btn btn-o btn-xs" onClick={() => setModal({ type: "brand", data: b })}>editar</button>
                  <button className="btn btn-r btn-xs" onClick={() => rem("brands", b.id)}>✕</button>
                </div>
              </div>
              {b.url && <a href={b.url} target="_blank" rel="noreferrer" className="lnk" style={{ display: "block", marginBottom: 4 }}>↗ {b.url}</a>}
              {b.formUrl && <a href={b.formUrl} target="_blank" rel="noreferrer" className="lnk-b" style={{ display: "block", marginBottom: 7 }}>↗ Formulário de parceria</a>}
              {b.niche && <div style={{ fontSize: 11.5, color: "#ADADAA", marginBottom: 5 }}>{b.niche}</div>}
              {b.requirements && <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.55, marginBottom: 7, borderTop: "1px solid #EAEAE6", paddingTop: 7 }}>{b.requirements}</div>}
              {b.notes && <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.55 }}>{b.notes}</div>}
              <div style={{ marginTop: 9, display: "flex", gap: 5, flexWrap: "wrap", borderTop: "1px solid #EAEAE6", paddingTop: 8 }}>
                {BRAND_DREAM_STATUS.filter(s => s !== b.status).map(s => <button key={s} className="btn btn-o btn-xs" onClick={() => updi("brands", b.id, { status: s })}>{s}</button>)}
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ─── CRM ─── */
function PageCRM({ ctx }) {
  const { data, rem, updi, setModal } = ctx;
  const [filter, setFilter] = useState("Todos");
  const filtered = filter === "Todos" ? data.crm : data.crm.filter(c => c.status === filter);
  const sb = s => ({ Lead: "bgray", Ativo: "bblue", Negociando: "bamber", Parceiro: "bgreen", Inativo: "bgray" })[s] || "bgray";
  return (
    <div className="page">
      <div className="pg-title">CRM de Marcas</div>
      <div className="pg-sub">Gerencie relacionamentos com contatos de marcas</div>
      <div className="sh">
        <div className="fr">{["Todos", ...CRM_STATUS].map(s => <button key={s} className={`fb${filter === s ? " on" : ""}`} onClick={() => setFilter(s)}>{s}</button>)}</div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "crm", data: null })}>+ Contato</button>
      </div>
      <div style={{ height: 13 }} />
      {filtered.length === 0
        ? <div className="empty"><div className="empty-ico">◎</div><div className="empty-t">Adicione contatos de marcas para acompanhar o relacionamento.</div></div>
        : <div className="g2">
          {filtered.map(c => (
            <div key={c.id} className="crm-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 7 }}>
                <div><div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{c.brand}</div>
                  {c.contact && <div style={{ fontSize: 12.5, color: "#6A6A66", marginBottom: 5 }}>{c.contact}{c.role ? ` · ${c.role}` : ""}</div>}
                  <span className={`badge ${sb(c.status)}`}>{c.status}</span></div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button className="btn btn-o btn-xs" onClick={() => setModal({ type: "crm", data: c })}>editar</button>
                  <button className="btn btn-r btn-xs" onClick={() => rem("crm", c.id)}>✕</button>
                </div>
              </div>
              <div style={{ marginTop: 9, display: "flex", flexDirection: "column", gap: 3 }}>
                {c.email && <div style={{ fontSize: 12, color: "#6A6A66" }}>✉ {c.email}</div>}
                {c.phone && <div style={{ fontSize: 12, color: "#6A6A66" }}>📱 {c.phone}</div>}
                {c.lastContact && <div style={{ fontSize: 11.5, color: "#ADADAA" }}>Último contato: {new Date(c.lastContact + "T12:00").toLocaleDateString("pt-BR")}</div>}
                {c.nextAction && <div style={{ fontSize: 12, color: "#8A5500", background: "#FFF3DC", borderRadius: 6, padding: "5px 9px", marginTop: 3 }}>→ {c.nextAction}</div>}
                {c.notes && <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.55, borderTop: "1px solid #EAEAE6", paddingTop: 7, marginTop: 4 }}>{c.notes}</div>}
              </div>
              <div style={{ marginTop: 9, display: "flex", gap: 5, flexWrap: "wrap", borderTop: "1px solid #EAEAE6", paddingTop: 8 }}>
                {CRM_STATUS.filter(s => s !== c.status).map(s => <button key={s} className="btn btn-o btn-xs" onClick={() => updi("crm", c.id, { status: s })}>{s}</button>)}
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ─── PLATFORMS ─── */
function PagePlatforms({ ctx }) {
  const { data, rem, setModal } = ctx;
  const [filter, setFilter] = useState("Todos");
  const catIco = { Influencer: "🤝", UGC: "🎬", Ferramentas: "🛠️" };
  const filtered = filter === "Todos" ? data.platforms : data.platforms.filter(p => p.cat === filter);
  return (
    <div className="page">
      <div className="pg-title">Plataformas & Apps</div>
      <div className="pg-sub">Sites e ferramentas para parcerias e criação</div>
      <div className="sh">
        <div className="fr">{PLAT_CATS.map(c => <button key={c} className={`fb${filter === c ? " on" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}</div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "platform", data: null })}>+ Adicionar</button>
      </div>
      <div style={{ height: 13 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ display: "flex", gap: 13, alignItems: "flex-start", background: "#fff", borderRadius: 11, border: "1px solid #EAEAE6", padding: "14px 17px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#F0F0EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{catIco[p.cat] || "🔗"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
              <a href={p.url} target="_blank" rel="noreferrer" className="lnk">{p.url}</a>
              {p.desc && <div style={{ fontSize: 12, color: "#7A7A76", marginTop: 4, lineHeight: 1.55 }}>{p.desc}</div>}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span className={`badge ${p.cat === "UGC" ? "bblue" : p.cat === "Ferramentas" ? "bgray" : "bamber"}`}>{p.cat}</span>
              <button className="btn btn-r btn-xs" onClick={() => rem("platforms", p.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TENDÊNCIAS IA ─── */
function PageTendencias({ ctx }) {
  const { data, upd } = ctx;
  const niches = ["Beleza & Skincare","Moda","Lifestyle","Autocuidado","UGC","Decoração","Fitness"];
  const [selectedNiches, setSelectedNiches] = useState(data.tendencias_prefs?.niches || ["Beleza & Skincare","Lifestyle"]);
  const [result, setResult] = useState(data.tendencias_cache || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(data.tendencias_cache?.fetchedAt || null);

  const toggleNiche = n => setSelectedNiches(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n]);

  const fetchTrends = async () => {
    if (!selectedNiches.length) return;
    setLoading(true); setError(null);
    upd("tendencias_prefs", { niches: selectedNiches });
    try {
      const prompt = `Você é um especialista em marketing de conteúdo para criadores brasileiros no Instagram e TikTok.

Pesquise e analise as tendências ATUAIS (${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}) nos seguintes nichos: ${selectedNiches.join(", ")}.

Retorne SOMENTE um JSON válido, sem markdown, sem explicações, neste formato exato:
{
  "trending_topics": [
    { "titulo": "", "descricao": "", "formato": "", "porque_funciona": "", "nicho": "" }
  ],
  "ideias_conteudo": [
    { "titulo": "", "hook": "", "roteiro_resumido": "", "formato": "", "nicho": "" }
  ],
  "criadores_referencia": [
    { "handle": "", "plataforma": "", "porque_seguir": "", "nicho": "" }
  ],
  "sons_tendencia": [
    { "descricao": "", "como_usar": "" }
  ],
  "dica_semana": ""
}

Retorne 5 trending_topics, 6 ideias_conteudo, 4 criadores_referencia, 3 sons_tendencia. Foque em tendências reais e atuais do mercado brasileiro.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }]
        })
      });
      const raw = await res.json();
      const text = (raw.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const jsonStart = clean.indexOf("{");
      const jsonEnd = clean.lastIndexOf("}");
      const parsed = JSON.parse(clean.slice(jsonStart, jsonEnd + 1));
      const cache = { ...parsed, fetchedAt: new Date().toISOString() };
      setResult(cache);
      setLastFetch(cache.fetchedAt);
      upd("tendencias_cache", cache);
    } catch (err) {
      setError("Erro ao buscar tendências. Tente novamente.");
    }
    setLoading(false);
  };

  const fmtDate = iso => iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <div className="page">
      <div className="pg-title">Tendências IA ✦</div>
      <div className="pg-sub">A IA pesquisa o que está em alta no seu nicho agora mesmo</div>

      {/* Config */}
      <div style={{ background: "#fff", border: "1px solid #EAEAE6", borderRadius: 12, padding: "18px 20px", marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Quais nichos você quer monitorar?</div>
        <div className="fr" style={{ marginBottom: 14 }}>
          {niches.map(n => (
            <button key={n} className={`fb${selectedNiches.includes(n) ? " on" : ""}`} onClick={() => toggleNiche(n)}>{n}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-k" onClick={fetchTrends} disabled={loading || !selectedNiches.length}
            style={{ opacity: loading ? .6 : 1, cursor: loading ? "wait" : "pointer" }}>
            {loading ? "🔍 Pesquisando..." : "✦ Buscar tendências agora"}
          </button>
          {lastFetch && <span style={{ fontSize: 11.5, color: "#ADADAA" }}>Última pesquisa: {fmtDate(lastFetch)}</span>}
        </div>
        {error && <div style={{ fontSize: 12.5, color: "#A84050", marginTop: 10 }}>{error}</div>}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Pesquisando tendências...</div>
          <div style={{ fontSize: 12.5, color: "#ADADAA" }}>A IA está analisando o mercado nos seus nichos</div>
        </div>
      )}

      {result && !loading && (<>
        {result.dica_semana && (
          <div style={{ background: "#0A0A0A", color: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>💡 Dica da semana</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.65 }}>{result.dica_semana}</div>
          </div>
        )}

        {/* Trending Topics */}
        {result.trending_topics?.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div className="sh"><div className="st">🔥 Trending agora</div></div>
            <div className="g2">
              {result.trending_topics.map((t, i) => (
                <div key={i} style={{ background: "#fff", border: "1.5px solid #EAEAE6", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", gap: 7, marginBottom: 7, flexWrap: "wrap" }}>
                    <span className="badge brose">{t.nicho}</span>
                    <span className="badge bgray">{t.formato}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 5 }}>{t.titulo}</div>
                  <div style={{ fontSize: 12.5, color: "#6A6A66", lineHeight: 1.6, marginBottom: 8 }}>{t.descricao}</div>
                  {t.porque_funciona && <div style={{ fontSize: 11.5, color: "#1A6A40", background: "#E4F5EC", borderRadius: 6, padding: "5px 9px" }}>✓ {t.porque_funciona}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ideias de Conteúdo */}
        {result.ideias_conteudo?.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div className="sh"><div className="st">✨ Ideias prontas para gravar</div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {result.ideias_conteudo.map((idea, i) => (
                <div key={i} style={{ background: "#fff", border: "1.5px solid #EAEAE6", borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                        <span className="badge bamber">{idea.nicho}</span>
                        <span className="badge bgray">{idea.formato}</span>
                      </div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 5 }}>{idea.titulo}</div>
                      {idea.hook && <div style={{ fontSize: 12.5, color: "#8A5500", background: "#FFF3DC", borderRadius: 6, padding: "5px 9px", marginBottom: 7 }}><strong>Hook: </strong>{idea.hook}</div>}
                      {idea.roteiro_resumido && <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.6 }}>{idea.roteiro_resumido}</div>}
                    </div>
                    <button className="btn btn-o btn-xs" style={{ flexShrink: 0 }} onClick={() => {
                      ctx.add("gravar", { id: uid(), title: idea.titulo, roteiro: idea.roteiro_resumido || "", inspoLinks: [], cat: idea.formato || "Reels", status: "Para gravar", priority: "Normal", createdAt: todayStr() });
                      alert("Adicionado em Para Gravar!");
                    }}>+ Gravar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="trend-grid">
          {/* Criadores */}
          {result.criadores_referencia?.length > 0 && (
            <div>
              <div className="sh"><div className="st">👀 Criadores em alta</div></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.criadores_referencia.map((c, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #EAEAE6", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.handle}</div>
                    <div style={{ fontSize: 11, color: "#ADADAA", marginBottom: 4 }}>{c.plataforma} · {c.nicho}</div>
                    <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.55 }}>{c.porque_seguir}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sons */}
          {result.sons_tendencia?.length > 0 && (
            <div>
              <div className="sh"><div className="st">🎵 Sons em tendência</div></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.sons_tendencia.map((s, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #EAEAE6", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{s.descricao}</div>
                    <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.55 }}>{s.como_usar}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>)}

      {!result && !loading && (
        <div className="empty">
          <div className="empty-ico">✦</div>
          <div className="empty-t">Selecione seus nichos e clique em<br /><strong>"Buscar tendências agora"</strong><br />para ver o que está em alta!</div>
        </div>
      )}
    </div>
  );
}

/* ─── SITES DIÁRIOS ─── */
function PageSitesDiarios({ ctx }) {
  const { data, upd, rem, setModal } = ctx;
  const SITE_CATS = ["Todos","Moda","Beleza","Lifestyle","Decoração","Saúde","Informação","Outro"];
  const [filter, setFilter] = useState("Todos");
  const [showAdd, setShowAdd] = useState(false);
  const [newSite, setNewSite] = useState({ name: "", url: "", cat: "Moda", desc: "" });
  const sites = (data.sitesdiarios || []).filter(s => filter === "Todos" || s.cat === filter);
  const catColor = c => ({ Moda: "#FF6B6B", Beleza: "#A29BFE", Lifestyle: "#FFB347", Decoração: "#74B9FF", Saúde: "#55D496", Informação: "#ADADAA", Outro: "#D0D0CA" })[c] || "#ADADAA";
  const catBadge = c => ({ Moda: "brose", Beleza: "bpurple", Lifestyle: "bamber", Decoração: "bblue", Saúde: "bgreen", Informação: "bgray", Outro: "bgray" })[c] || "bgray";

  const addSite = () => {
    if (!newSite.name.trim() || !newSite.url.trim()) return;
    const url = newSite.url.startsWith("http") ? newSite.url : "https://" + newSite.url;
    upd("sitesdiarios", [...(data.sitesdiarios || []), { ...newSite, url, id: uid() }]);
    setNewSite({ name: "", url: "", cat: "Moda", desc: "" });
    setShowAdd(false);
  };

  return (
    <div className="page">
      <div className="pg-title">Sites Diários</div>
      <div className="pg-sub">Portais de moda, beleza, lifestyle e informação para se inspirar todo dia</div>

      <div className="sh">
        <div className="fr">{SITE_CATS.map(c => <button key={c} className={`fb${filter === c ? " on" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}</div>
        <button className="btn btn-k btn-sm" onClick={() => setShowAdd(s => !s)}>+ Adicionar site</button>
      </div>
      <div style={{ height: 14 }} />

      {showAdd && (
        <div style={{ background: "#fff", border: "1.5px solid #0A0A0A", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Novo site</div>
          <div className="two-col">
            <div className="field"><label>Nome</label><input autoFocus value={newSite.name} onChange={e => setNewSite(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Vogue Brasil" /></div>
            <div className="field"><label>URL</label><input value={newSite.url} onChange={e => setNewSite(p => ({ ...p, url: e.target.value }))} placeholder="https://..." /></div>
            <div className="field"><label>Categoria</label>
              <select value={newSite.cat} onChange={e => setNewSite(p => ({ ...p, cat: e.target.value }))}>
                {["Moda","Beleza","Lifestyle","Decoração","Saúde","Informação","Outro"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label>Descrição</label><input value={newSite.desc} onChange={e => setNewSite(p => ({ ...p, desc: e.target.value }))} placeholder="Para que serve..." /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-k btn-sm" onClick={addSite}>Salvar</button>
            <button className="btn btn-o btn-sm" onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Group by category */}
      {filter === "Todos" ? (
        ["Moda","Beleza","Lifestyle","Decoração","Saúde","Informação","Outro"].map(cat => {
          const catSites = (data.sitesdiarios || []).filter(s => s.cat === cat);
          if (!catSites.length) return null;
          return (
            <div key={cat} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: catColor(cat), flexShrink: 0 }} />
                <div style={{ fontSize: 14, fontWeight: 700 }}>{cat}</div>
                <div style={{ fontSize: 12, color: "#ADADAA" }}>{catSites.length} site{catSites.length !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 9 }}>
                {catSites.map(s => <SiteCard key={s.id} site={s} ctx={ctx} catBadge={catBadge} />)}
              </div>
            </div>
          );
        })
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 9 }}>
          {sites.map(s => <SiteCard key={s.id} site={s} ctx={ctx} catBadge={catBadge} />)}
        </div>
      )}

      {!sites.length && !showAdd && (
        <div className="empty"><div className="empty-ico">🌐</div><div className="empty-t">Nenhum site nesta categoria</div></div>
      )}
    </div>
  );
}

function SiteCard({ site, ctx, catBadge }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #EAEAE6", borderRadius: 12, padding: "15px 17px", transition: "border-color .12s", cursor: "default" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#0A0A0A"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#EAEAE6"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{site.name}</div>
        <button className="btn btn-r btn-xs" onClick={() => ctx.rem("sitesdiarios", site.id)}>✕</button>
      </div>
      <span className={`badge ${catBadge(site.cat)}`} style={{ marginBottom: 7, display: "inline-block" }}>{site.cat}</span>
      {site.desc && <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.55, marginBottom: 10 }}>{site.desc}</div>}
      <a href={site.url} target="_blank" rel="noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0A0A0A", color: "#fff", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none", transition: "background .1s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#2A2A2A"}
        onMouseLeave={e => e.currentTarget.style.background = "#0A0A0A"}>
        Abrir site ↗
      </a>
    </div>
  );
}

/* ─── CREATORS ─── */
function PageCreators({ ctx }) {
  const { data, rem, setModal } = ctx;
  const avs = ["#0A0A0A", "#C9A56A", "#74B9FF", "#A29BFE", "#55D496"];
  return (
    <div className="page">
      <div className="pg-title">Creators para Inspiração</div>
      <div className="pg-sub">Perfis para acompanhar e se inspirar</div>
      <div className="sh"><div className="st">{data.creators.length} criadora{data.creators.length !== 1 ? "s" : ""}</div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "creator", data: null })}>+ Criadora</button></div>
      {data.creators.length === 0
        ? <div className="empty"><div className="empty-ico">✨</div><div className="empty-t">Nenhuma criadora salva ainda</div></div>
        : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.creators.map((c, i) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 16px", background: "#fff", borderRadius: 11, border: "1px solid #EAEAE6" }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: avs[i % 5], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{c.handle.slice(1, 3).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.handle}</div>
                <div style={{ fontSize: 11.5, color: "#ADADAA", marginTop: 1 }}>{c.platform}{c.niche ? ` · ${c.niche}` : ""}</div>
                {c.notes && <div style={{ fontSize: 12, color: "#7A7A76", marginTop: 3 }}>{c.notes}</div>}
              </div>
              <button className="btn btn-r btn-xs" onClick={() => rem("creators", c.id)}>✕</button>
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ─── UGC ─── */
function PageUGC({ ctx }) {
  const { data, rem, setModal } = ctx;
  const [filter, setFilter] = useState("Todos");
  const cats = ["Todos", "Beleza", "Skincare", "Produto", "Lifestyle", "Outro"];
  const filtered = filter === "Todos" ? data.ugcRefs : data.ugcRefs.filter(u => u.cat === filter);
  return (
    <div className="page">
      <div className="pg-title">Referências UGC</div>
      <div className="pg-sub">Vídeos e conteúdos que te inspiram como referência</div>
      <div className="sh">
        <div className="fr">{cats.map(c => <button key={c} className={`fb${filter === c ? " on" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}</div>
        <button className="btn btn-k btn-sm" onClick={() => setModal({ type: "ugc", data: null })}>+ Referência</button>
      </div>
      <div style={{ height: 13 }} />
      {filtered.length === 0
        ? <div className="empty"><div className="empty-ico">🎬</div><div className="empty-t">Nenhuma referência salva.<br />Salve vídeos que te inspiram!</div></div>
        : <div className="g2">
          {filtered.map(u => (
            <div key={u.id} className="card cp">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 7, marginBottom: 6 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{u.title}</div>
                <button className="btn btn-r btn-xs" onClick={() => rem("ugcRefs", u.id)}>✕</button>
              </div>
              <span className="badge bblue" style={{ marginBottom: 7, display: "inline-block" }}>{u.cat}</span>
              {u.url && <a href={u.url} target="_blank" rel="noreferrer" className="lnk" style={{ display: "block", marginBottom: 5 }}>{u.url}</a>}
              {u.creator && <div style={{ fontSize: 11.5, color: "#ADADAA", marginBottom: 5 }}>por {u.creator}</div>}
              {u.notes && <div style={{ fontSize: 12, color: "#6A6A66", lineHeight: 1.55 }}>{u.notes}</div>}
            </div>
          ))}
        </div>}
    </div>
  );
}

/* ─── PROFILE ─── */
function PageProfile({ ctx, onSetPin }) {
  const { data, upd } = ctx;
  const auth = ctx.auth;
  const [pr, setPr] = useState(data.profile);
  const ch = k => e => setPr(p => ({ ...p, [k]: e.target.value }));
  const save = () => { upd("profile", pr); alert("Salvo!"); };
  return (
    <div className="page">
      <div className="pg-title">Meu Perfil</div>
      <div className="pg-sub">Suas informações para o mídia kit e pitches para marcas</div>
      <div style={{ maxWidth: 620 }}>
        <div className="prof-sec">Conta</div>
        <div style={{ background: "#FAFAF8", border: "1px solid #EAEAE6", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>{auth.configured ? auth.email : "Supabase ainda não configurado"}</div>
          <div style={{ fontSize: 12.5, color: auth.syncError ? "#A84050" : "#6A6A66", lineHeight: 1.6 }}>
            {auth.configured
              ? auth.syncError || auth.syncing || (auth.lastRemoteSave ? `Salvo na nuvem às ${auth.lastRemoteSave.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Sincronização na nuvem ativa.")
              : "Preencha as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar login e sincronização."}
          </div>
          {auth.configured && <button className="btn btn-o btn-sm" onClick={auth.signOut} style={{ marginTop: 11 }}>Sair da conta</button>}
        </div>
        <div className="prof-sec">Informações básicas</div>
        <div className="two-col">
          <div className="field"><label>Nome completo</label><input value={pr.name} onChange={ch("name")} placeholder="Seu nome" /></div>
          <div className="field"><label>@Handle</label><input value={pr.handle} onChange={ch("handle")} placeholder="@seuperfil" /></div>
          <div className="field"><label>Email para parcerias</label><input value={pr.email} onChange={ch("email")} placeholder="parceria@email.com" /></div>
          <div className="field"><label>WhatsApp</label><input value={pr.phone} onChange={ch("phone")} placeholder="+55 81 99999-9999" /></div>
          <div className="field"><label>Localização</label><input value={pr.location} onChange={ch("location")} placeholder="Caruaru, PE" /></div>
          <div className="field"><label>Nicho</label><input value={pr.niche} onChange={ch("niche")} placeholder="Beleza · Skincare · Lifestyle" /></div>
        </div>
        <div className="dv" />
        <div className="prof-sec">Bio do Instagram</div>
        <div className="field">
          <label>Bio (máx. 150 caracteres)</label>
          <textarea value={pr.bio} onChange={ch("bio")} placeholder={"me cuidando e documentando tudo ✦\nbeleza · skincare · vida real\n📍 Caruaru, PE"} style={{ minHeight: 96 }} />
          <div style={{ fontSize: 10.5, color: pr.bio?.length > 150 ? "#A84050" : "#ADADAA", marginTop: 3 }}>{pr.bio?.length || 0}/150</div>
        </div>
        <div className="dv" />
        <div className="prof-sec">Texto de apresentação</div>
        <div className="field">
          <label>Apresentação completa (para mídia kit)</label>
          <textarea value={pr.presentation} onChange={ch("presentation")} placeholder="Escreva aqui seu texto de apresentação para enviar para marcas..." style={{ minHeight: 120 }} />
        </div>
        <div className="dv" />
        <div className="prof-sec">Métricas</div>
        <div className="three-col">
          <div className="field"><label>Seguidores</label><input value={pr.followers} onChange={ch("followers")} placeholder="ex: 3.200" /></div>
          <div className="field"><label>Engajamento</label><input value={pr.engagement} onChange={ch("engagement")} placeholder="ex: 4,2%" /></div>
          <div className="field"><label>Alcance médio</label><input value={pr.avgReach} onChange={ch("avgReach")} placeholder="ex: 1.500" /></div>
        </div>
        <div className="dv" />
        <div className="prof-sec">Mídia Kit</div>
        <div className="field"><label>Link do mídia kit</label><input value={pr.mediakit} onChange={ch("mediakit")} placeholder="https://..." /></div>
        <div className="dv" />
        <div className="prof-sec">Segurança — PIN</div>
        <div style={{ background: "#FAFAF8", border: "1px solid #EAEAE6", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>Bloqueio com PIN</div>
          <div style={{ fontSize: 12.5, color: "#6A6A66", marginBottom: 11, lineHeight: 1.6 }}>Ative um PIN de 4 dígitos para proteger o hub.</div>
          <div style={{ display: "flex", gap: 7 }}>
            <button className="btn btn-k btn-sm" onClick={onSetPin}>{data.pinEnabled ? "Alterar PIN" : "Configurar PIN"}</button>
            {data.pinEnabled && <button className="btn btn-o btn-sm" onClick={() => { ctx.upd("pinEnabled", false); ctx.upd("pin", null); }}>Desativar</button>}
          </div>
        </div>
        <button className="btn btn-k" onClick={save}>Salvar informações</button>
      </div>
    </div>
  );
}

/* ─── AUTOMAÇÕES ─── */
function PageAutomations({ ctx }) {
  const { data, upd } = ctx;
  const auto = data.automations;
  const [copied, setCopied] = useState(null);
  const [nCheck, setNCheck] = useState("");
  const [nTag, setNTag] = useState("");
  const [nCap, setNCap] = useState("");
  const [nDM, setNDM] = useState("");
  const copy = (id, text) => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(id); setTimeout(() => setCopied(null), 1400); };
  const tog = id => upd("automations", { ...auto, checklist: auto.checklist.map(c => c.id === id ? { ...c, done: !c.done } : c) });
  const remAuto = (key, id) => upd("automations", { ...auto, [key]: auto[key].filter(x => x.id !== id) });
  const addItem = (key, text, setter) => { if (!text.trim()) return; upd("automations", { ...auto, [key]: [...auto[key], { id: uid(), text }] }); setter(""); };
  const done = auto.checklist.filter(c => c.done).length;
  return (
    <div className="page">
      <div className="pg-title">Automações</div>
      <div className="pg-sub">Templates e checklists para publicar com consistência</div>

      <div className="auto-block">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="auto-title" style={{ margin: 0 }}>Checklist pré-publicação</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#ADADAA" }}>{done}/{auto.checklist.length}</span>
            <button className="btn btn-o btn-sm" onClick={() => upd("automations", { ...auto, checklist: auto.checklist.map(c => ({ ...c, done: false })) })}>↺ Resetar</button>
          </div>
        </div>
        {auto.checklist.map(c => (
          <div key={c.id} className="cl-item">
            <div className={`cl-box${c.done ? " ck" : ""}`} onClick={() => tog(c.id)}>{c.done && "✓"}</div>
            <div className={`cl-txt${c.done ? " done" : ""}`}>{c.text}</div>
            <button className="btn btn-r btn-xs" onClick={() => remAuto("checklist", c.id)}>✕</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 7, marginTop: 11 }}>
          <input value={nCheck} onChange={e => setNCheck(e.target.value)} placeholder="Adicionar item..." style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && (addItem("checklist", nCheck, setNCheck))} />
          <button className="btn btn-k btn-sm" onClick={() => addItem("checklist", nCheck, setNCheck)}>+</button>
        </div>
      </div>

      {[
        { key: "hashtagSets", title: "Sets de Hashtags", placeholder: "#beleza #skincare #autocuidado ...", state: nTag, setter: setNTag, inputType: "textarea" },
        { key: "captionTemplates", title: "Templates de Legenda", placeholder: "Escreva um template de legenda para copiar...", state: nCap, setter: setNCap, inputType: "textarea" },
        { key: "dmTemplates", title: "Templates de DM (para marcas)", placeholder: "Olá [nome], me chamo [nome] e sou criadora...", state: nDM, setter: setNDM, inputType: "textarea" },
      ].map(({ key, title, placeholder, state, setter }) => (
        <div key={key} className="auto-block">
          <div className="auto-title">{title}</div>
          {auto[key].length === 0 && <div style={{ fontSize: 12.5, color: "#ADADAA", marginBottom: 10 }}>Nenhum salvo ainda.</div>}
          {auto[key].map(item => (
            <div key={item.id} className="tpl">
              <div className="tpl-body">{item.text}</div>
              <button className={`copy-btn${copied === item.id ? " copied" : ""}`} onClick={() => copy(item.id, item.text)}>{copied === item.id ? "✓" : "Copiar"}</button>
              <button className="btn btn-r btn-xs" style={{ marginLeft: 4 }} onClick={() => remAuto(key, item.id)}>✕</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 7, marginTop: 8 }}>
            <textarea value={state} onChange={e => setter(e.target.value)} placeholder={placeholder} style={{ flex: 1, minHeight: 62 }} />
            <button className="btn btn-k btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => addItem(key, state, setter)}>Salvar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── MODALS ─── */
function Modals({ ctx }) {
  const { modal, closeModal } = ctx;
  return (
    <div className="ov" onClick={e => e.target === e.currentTarget && closeModal()}>
      {modal.type === "idea"     && <MIdea ctx={ctx} />}
      {modal.type === "hook"     && <MHook ctx={ctx} />}
      {modal.type === "roteiro"  && <MRoteiro ctx={ctx} />}
      {modal.type === "brand"    && <MBrand ctx={ctx} />}
      {modal.type === "crm"      && <MCRM ctx={ctx} />}
      {modal.type === "platform" && <MPlatform ctx={ctx} />}
      {modal.type === "creator"  && <MCreator ctx={ctx} />}
      {modal.type === "ugc"      && <MUGC ctx={ctx} />}
      {modal.type === "post"     && <MPost ctx={ctx} />}
      {modal.type === "calDay"   && <MCalDay ctx={ctx} />}
      {modal.type === "gravar"   && <MGravar ctx={ctx} />}
      {modal.type === "editar"   && <MEditar ctx={ctx} />}
    </div>
  );
}

const Wrap = ({ title, children }) => <div className="modal"><div className="mt">{title}</div>{children}</div>;
const F = ({ l, children }) => <div className="field"><label>{l}</label>{children}</div>;
const Btns = ({ ctx, onSave }) => <div className="mr"><button className="btn btn-o" onClick={ctx.closeModal}>Cancelar</button><button className="btn btn-k" onClick={onSave}>Salvar</button></div>;

function MIdea({ ctx }) {
  const { modal, closeModal, add, updi } = ctx; const e = modal.data;
  const [f, setF] = useState(e || { title: "", content: "", cat: "Beleza" });
  const ch = k => ev => setF(p => ({ ...p, [k]: ev.target.value }));
  const save = () => { if (!f.title.trim()) return; e ? updi("ideas", e.id, f) : add("ideas", { ...f, id: uid(), done: false, date: todayStr() }); closeModal(); };
  return <Wrap title={e ? "Editar ideia" : "Nova ideia"}><F l="Título"><input autoFocus value={f.title} onChange={ch("title")} placeholder="Ideia de conteúdo..." /></F><F l="Detalhes"><textarea value={f.content} onChange={ch("content")} placeholder="Detalhes, referências..." /></F><F l="Categoria"><select value={f.cat} onChange={ch("cat")}>{["Beleza","Skincare","Lifestyle","Motivacional","UGC","Moda","Outro"].map(c => <option key={c}>{c}</option>)}</select></F><Btns ctx={ctx} onSave={save} /></Wrap>;
}
function MHook({ ctx }) {
  const { closeModal, add } = ctx;
  const [f, setF] = useState({ text: "", cat: "Pergunta" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const save = () => { if (!f.text.trim()) return; add("hooks", { ...f, id: uid() }); closeModal(); };
  return <Wrap title="Novo hook viral"><F l="Frase do hook"><textarea autoFocus value={f.text} onChange={ch("text")} placeholder="A frase que vai prender nos primeiros 3s..." style={{ minHeight: 80 }} /></F><F l="Categoria"><select value={f.cat} onChange={ch("cat")}>{["Pergunta","Choque","Promessa","História","Polêmica","Curiosidade"].map(c => <option key={c}>{c}</option>)}</select></F><Btns ctx={ctx} onSave={save} /></Wrap>;
}
function MRoteiro({ ctx }) {
  const { modal, closeModal, add, updi } = ctx; const e = modal.data;
  const [f, setF] = useState(e || { title: "", type: "Reels", duration: "30s", hook: "", body: "", cta: "" });
  const ch = k => ev => setF(p => ({ ...p, [k]: ev.target.value }));
  const save = () => { if (!f.title.trim()) return; e ? updi("roteiros", e.id, f) : add("roteiros", { ...f, id: uid() }); closeModal(); };
  return <Wrap title={e ? "Editar roteiro" : "Novo roteiro"}><div className="two-col"><F l="Título"><input autoFocus value={f.title} onChange={ch("title")} placeholder="Nome do vídeo" /></F><F l="Duração"><input value={f.duration} onChange={ch("duration")} placeholder="30s" /></F></div><F l="Formato"><select value={f.type} onChange={ch("type")}>{POST_TYPES.map(t => <option key={t}>{t}</option>)}</select></F><F l="Hook"><input value={f.hook} onChange={ch("hook")} placeholder="Frase de abertura..." /></F><F l="Desenvolvimento"><textarea value={f.body} onChange={ch("body")} placeholder="Conteúdo, pontos principais..." style={{ minHeight: 90 }} /></F><F l="CTA"><input value={f.cta} onChange={ch("cta")} placeholder="Ex: Salva esse vídeo!" /></F><Btns ctx={ctx} onSave={save} /></Wrap>;
}
function MBrand({ ctx }) {
  const { modal, closeModal, add, updi } = ctx; const e = modal.data;
  const [f, setF] = useState(e || { name: "", url: "", formUrl: "", niche: "", requirements: "", notes: "", status: "Quero muito" });
  const ch = k => ev => setF(p => ({ ...p, [k]: ev.target.value }));
  const save = () => { if (!f.name.trim()) return; e ? updi("brands", e.id, f) : add("brands", { ...f, id: uid() }); closeModal(); };
  return <Wrap title={e ? "Editar marca" : "Nova marca dos sonhos"}><F l="Nome da marca"><input autoFocus value={f.name} onChange={ch("name")} placeholder="Nome da marca" /></F><div className="two-col"><F l="Site / Instagram"><input value={f.url} onChange={ch("url")} placeholder="https://..." /></F><F l="Formulário"><input value={f.formUrl} onChange={ch("formUrl")} placeholder="https://..." /></F><F l="Nicho"><input value={f.niche} onChange={ch("niche")} placeholder="Beleza, Moda..." /></F><F l="Status"><select value={f.status} onChange={ch("status")}>{BRAND_DREAM_STATUS.map(s => <option key={s}>{s}</option>)}</select></F></div><F l="Requisitos"><textarea value={f.requirements} onChange={ch("requirements")} placeholder="Seguidores mínimos, nicho..." style={{ minHeight: 60 }} /></F><F l="Notas"><textarea value={f.notes} onChange={ch("notes")} placeholder="Observações..." style={{ minHeight: 54 }} /></F><Btns ctx={ctx} onSave={save} /></Wrap>;
}
function MCRM({ ctx }) {
  const { modal, closeModal, add, updi } = ctx; const e = modal.data;
  const [f, setF] = useState(e || { brand: "", contact: "", role: "", email: "", phone: "", status: "Lead", lastContact: "", nextAction: "", notes: "" });
  const ch = k => ev => setF(p => ({ ...p, [k]: ev.target.value }));
  const save = () => { if (!f.brand.trim()) return; e ? updi("crm", e.id, f) : add("crm", { ...f, id: uid() }); closeModal(); };
  return <Wrap title={e ? "Editar contato" : "Novo contato CRM"}><div className="two-col"><F l="Marca"><input autoFocus value={f.brand} onChange={ch("brand")} placeholder="Nome da marca" /></F><F l="Status"><select value={f.status} onChange={ch("status")}>{CRM_STATUS.map(s => <option key={s}>{s}</option>)}</select></F><F l="Nome do contato"><input value={f.contact} onChange={ch("contact")} placeholder="Nome da pessoa" /></F><F l="Cargo"><input value={f.role} onChange={ch("role")} placeholder="Marketing..." /></F><F l="Email"><input value={f.email} onChange={ch("email")} placeholder="contato@marca.com" /></F><F l="WhatsApp"><input value={f.phone} onChange={ch("phone")} placeholder="+55..." /></F><F l="Último contato"><input type="date" value={f.lastContact} onChange={ch("lastContact")} /></F></div><F l="Próxima ação"><input value={f.nextAction} onChange={ch("nextAction")} placeholder="Ex: Enviar mídia kit, Follow-up..." /></F><F l="Notas"><textarea value={f.notes} onChange={ch("notes")} style={{ minHeight: 60 }} /></F><Btns ctx={ctx} onSave={save} /></Wrap>;
}
function MPlatform({ ctx }) {
  const { closeModal, add } = ctx;
  const [f, setF] = useState({ name: "", url: "", desc: "", cat: "Influencer" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const save = () => { if (!f.name.trim()) return; add("platforms", { ...f, id: uid() }); closeModal(); };
  return <Wrap title="Nova plataforma"><F l="Nome"><input autoFocus value={f.name} onChange={ch("name")} placeholder="Nome da plataforma" /></F><F l="URL"><input value={f.url} onChange={ch("url")} placeholder="https://..." /></F><F l="Categoria"><select value={f.cat} onChange={ch("cat")}>{["Influencer","UGC","Ferramentas"].map(c => <option key={c}>{c}</option>)}</select></F><F l="Descrição"><textarea value={f.desc} onChange={ch("desc")} style={{ minHeight: 66 }} /></F><Btns ctx={ctx} onSave={save} /></Wrap>;
}
function MCreator({ ctx }) {
  const { closeModal, add } = ctx;
  const [f, setF] = useState({ handle: "", platform: "Instagram", niche: "", notes: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const save = () => { if (!f.handle.trim()) return; add("creators", { ...f, id: uid() }); closeModal(); };
  return <Wrap title="Nova inspiração"><div className="two-col"><F l="@Handle"><input autoFocus value={f.handle} onChange={ch("handle")} placeholder="@nomedacriadora" /></F><F l="Plataforma"><select value={f.platform} onChange={ch("platform")}>{["Instagram","TikTok","Instagram/TikTok","YouTube"].map(p => <option key={p}>{p}</option>)}</select></F></div><F l="Nicho"><input value={f.niche} onChange={ch("niche")} placeholder="Beleza & Lifestyle" /></F><F l="Por que te inspira"><textarea value={f.notes} onChange={ch("notes")} style={{ minHeight: 66 }} /></F><Btns ctx={ctx} onSave={save} /></Wrap>;
}
function MUGC({ ctx }) {
  const { closeModal, add } = ctx;
  const [f, setF] = useState({ title: "", url: "", creator: "", cat: "Beleza", notes: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const save = () => { if (!f.title.trim()) return; add("ugcRefs", { ...f, id: uid() }); closeModal(); };
  return <Wrap title="Nova referência UGC"><F l="Título"><input autoFocus value={f.title} onChange={ch("title")} placeholder="Ex: Review de sérum com antes e depois" /></F><F l="Link"><input value={f.url} onChange={ch("url")} placeholder="https://..." /></F><div className="two-col"><F l="Criadora"><input value={f.creator} onChange={ch("creator")} placeholder="@handle" /></F><F l="Categoria"><select value={f.cat} onChange={ch("cat")}>{["Beleza","Skincare","Produto","Lifestyle","Outro"].map(c => <option key={c}>{c}</option>)}</select></F></div><F l="O que te inspira"><textarea value={f.notes} onChange={ch("notes")} style={{ minHeight: 66 }} /></F><Btns ctx={ctx} onSave={save} /></Wrap>;
}
function MPost({ ctx }) {
  const { modal, closeModal, add } = ctx;
  const [f, setF] = useState({ title: "", type: "Reels", date: modal.data?.date || todayStr(), status: "Planejado", notes: "" });
  const ch = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const save = () => { if (!f.title.trim()) return; add("calendar", { ...f, id: uid() }); closeModal(); };
  return <Wrap title="Agendar post"><F l="Título / tema"><input autoFocus value={f.title} onChange={ch("title")} placeholder="Ex: Rotina matinal de skincare" /></F><div className="two-col"><F l="Data"><input type="date" value={f.date} onChange={ch("date")} /></F><F l="Formato"><select value={f.type} onChange={ch("type")}>{POST_TYPES.map(t => <option key={t}>{t}</option>)}</select></F></div><F l="Status"><select value={f.status} onChange={ch("status")}>{POST_STATUS.map(s => <option key={s}>{s}</option>)}</select></F><F l="Notas"><textarea value={f.notes} onChange={ch("notes")} placeholder="Hashtags, produtos, detalhes..." style={{ minHeight: 56 }} /></F><Btns ctx={ctx} onSave={save} /></Wrap>;
}
function MCalDay({ ctx }) {
  const { modal, closeModal, setModal, data, rem, updi } = ctx;
  const date = modal.data;
  const posts = data.calendar.filter(p => p.date === date);
  const label = new Date(date + "T12:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  return (
    <Wrap title={label}>
      {posts.length === 0 ? <div style={{ textAlign: "center", padding: "18px 0", color: "#ADADAA", fontSize: 13 }}>Nenhum post neste dia</div>
        : posts.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", background: "#FAFAF8", borderRadius: 8, border: "1px solid #EAEAE6", marginBottom: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: postColor(p.type), flexShrink: 0 }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div><div style={{ fontSize: 10.5, color: "#ADADAA" }}>{p.type}</div></div>
            <select value={p.status} onChange={e => updi("calendar", p.id, { status: e.target.value })} style={{ width: "auto", fontSize: 11, padding: "3px 6px" }}>{POST_STATUS.map(s => <option key={s}>{s}</option>)}</select>
            <button className="btn btn-r btn-xs" onClick={() => rem("calendar", p.id)}>✕</button>
          </div>
        ))}
      <div className="mr">
        <button className="btn btn-o" onClick={closeModal}>Fechar</button>
        <button className="btn btn-k" onClick={() => setModal({ type: "post", data: { date } })}>+ Adicionar post</button>
      </div>
    </Wrap>
  );
}

function MGravar({ ctx }) {
  const { modal, closeModal, add, updiGravar, data } = ctx; const e = modal.data;
  const [f, setF] = useState(e || { title: "", roteiroId: "", inspoLinks: [""], cat: "Reels", status: "Para gravar", priority: "Normal" });
  const ch = k => ev => setF(p => ({ ...p, [k]: ev.target.value }));
  const addLink = () => setF(p => ({ ...p, inspoLinks: [...(p.inspoLinks||[]), ""] }));
  const updLink = (i, v) => setF(p => { const l = [...(p.inspoLinks||[])]; l[i] = v; return { ...p, inspoLinks: l }; });
  const remLink = i => setF(p => { const l = (p.inspoLinks||[]).filter((_, idx) => idx !== i); return { ...p, inspoLinks: l.length ? l : [""] }; });
  const selectedRoteiro = data.roteiros.find(r => r.id === f.roteiroId);
  const save = () => {
    if (!f.title.trim()) return;
    const item = { ...f, inspoLinks: (f.inspoLinks||[]).filter(l => l.trim()), id: e ? e.id : uid(), createdAt: e ? e.createdAt : todayStr() };
    e ? updiGravar(e.id, item) : add("gravar", item);
    closeModal();
  };
  return (
    <Wrap title={e ? "Editar conteúdo" : "Novo conteúdo para gravar"}>
      <F l="Título do conteúdo"><input autoFocus value={f.title} onChange={ch("title")} placeholder="Ex: Rotina noturna de skincare" /></F>
      <div className="two-col">
        <F l="Categoria / Formato">
          <select value={f.cat} onChange={ch("cat")}>{["Reels","Carrossel","Stories","TikTok","UGC","Outro"].map(c => <option key={c}>{c}</option>)}</select>
        </F>
        <F l="Status">
          <select value={f.status} onChange={ch("status")}>{GRAVAR_STATUS.map(s => <option key={s}>{s}</option>)}</select>
        </F>
      </div>
      <F l="Prioridade">
        <select value={f.priority} onChange={ch("priority")}>{["Normal","Alta","Urgente"].map(p => <option key={p}>{p}</option>)}</select>
      </F>
      <F l="Roteiro relacionado">
        <select value={f.roteiroId || ""} onChange={ch("roteiroId")}>
          <option value="">Sem roteiro relacionado</option>
          {data.roteiros.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
      </F>
      {selectedRoteiro && (
        <div style={{ fontSize: 12, background: "#F8FBFF", border: "1px solid #DCEBFF", borderRadius: 7, padding: "9px 11px", marginBottom: 12, color: "#3A5268", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#5D85AA", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Prévia do roteiro</div>
          {roteiroText(selectedRoteiro) || "Esse roteiro ainda não tem texto preenchido."}
        </div>
      )}
      <div className="field">
        <label>Links de inspiração</label>
        {(f.inspoLinks||[""]).map((link, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input value={link} onChange={e => updLink(i, e.target.value)} placeholder={`https://... (referência ${i + 1})`} style={{ flex: 1 }} />
            <button className="btn btn-r btn-xs" onClick={() => remLink(i)} style={{ flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button className="btn btn-o btn-sm" onClick={addLink} style={{ marginTop: 2 }}>+ Adicionar link</button>
      </div>
      <Btns ctx={ctx} onSave={save} />
    </Wrap>
  );
}

function MEditar({ ctx }) {
  const { modal, closeModal, add, updi } = ctx; const e = modal.data;
  const [f, setF] = useState(e ? { ...e, inspoLinks: e.inspoLinks?.length ? e.inspoLinks : e.inspoUrl ? [e.inspoUrl] : [""] } : { title: "", notes: "", inspoLinks: [""], cat: "Reels", status: "Para editar", prazo: "", checklistRaw: "" });
  const ch = k => ev => setF(p => ({ ...p, [k]: ev.target.value }));
  const addLink = () => setF(p => ({ ...p, inspoLinks: [...(p.inspoLinks||[]), ""] }));
  const updLink = (i, v) => setF(p => { const l = [...(p.inspoLinks||[])]; l[i] = v; return { ...p, inspoLinks: l }; });
  const remLink = i => setF(p => { const l = (p.inspoLinks||[]).filter((_, idx) => idx !== i); return { ...p, inspoLinks: l.length ? l : [""] }; });
  const save = () => {
    if (!f.title.trim()) return;
    const checklist = f.checklistRaw ? f.checklistRaw.split("\n").map(l => l.trim()).filter(Boolean) : [];
    const inspoLinks = (f.inspoLinks||[]).filter(l => l.trim());
    const item = { ...f, inspoLinks, inspoUrl: inspoLinks[0] || "", checklist, id: e ? e.id : uid(), createdAt: e ? e.createdAt : todayStr() };
    e ? updi("editar", e.id, item) : add("editar", item);
    closeModal();
  };
  return (
    <Wrap title={e ? "Editar item" : "Novo conteúdo para editar"}>
      <F l="Título do vídeo"><input autoFocus value={f.title} onChange={ch("title")} placeholder="Ex: Reel skincare noturna" /></F>
      <div className="two-col">
        <F l="Categoria">
          <select value={f.cat} onChange={ch("cat")}>{["Reels","Carrossel","Stories","TikTok","UGC","Outro"].map(c => <option key={c}>{c}</option>)}</select>
        </F>
        <F l="Status">
          <select value={f.status} onChange={ch("status")}>{EDITAR_STATUS.map(s => <option key={s}>{s}</option>)}</select>
        </F>
      </div>
      <F l="Prazo de publicação"><input type="date" value={f.prazo} onChange={ch("prazo")} /></F>
      <F l="Notas de edição">
        <textarea value={f.notes} onChange={ch("notes")} placeholder="Transição no beat, legenda animada, filtro X, música Y..." style={{ minHeight: 80 }} />
      </F>
      <div className="field">
        <label>Referências de edição</label>
        {(f.inspoLinks||[""]).map((link, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <input value={link} onChange={e => updLink(i, e.target.value)} placeholder={`https://... (referência ${i + 1})`} style={{ flex: 1 }} />
            <button className="btn btn-r btn-xs" onClick={() => remLink(i)} style={{ flexShrink: 0 }}>✕</button>
          </div>
        ))}
        <button className="btn btn-o btn-sm" onClick={addLink} style={{ marginTop: 2 }}>+ Adicionar link</button>
      </div>
      <F l="Checklist de edição (uma tarefa por linha)">
        <textarea value={f.checklistRaw !== undefined ? f.checklistRaw : (e?.checklist || []).join("\n")} onChange={ch("checklistRaw")} placeholder={"Cortar silêncios\nAdicionar legendas\nColocar música\nAdicionar transição\nExportar em 1080p"} style={{ minHeight: 100 }} />
      </F>
      <Btns ctx={ctx} onSave={save} />
    </Wrap>
  );
}
