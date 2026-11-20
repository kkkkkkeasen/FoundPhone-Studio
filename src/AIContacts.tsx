import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Plus, Settings2, UserRound, MessageCircle, Volume2, Trash2, Save, LockKeyhole } from "lucide-react";

type Contact = {
  id: string; name: string; avatar: string; relationship: string;
  personality: string; background: string; speakingStyle: string;
};
type Config = {
  provider: string; baseUrl: string; model: string; apiKey: string;
  fishApiKey: string; voiceId: string; speed: string; pitch: string;
};
const CONTACTS_KEY = "foundphone.ai-contacts.v1";
const CONFIG_KEY = "foundphone.ai-config.v1";
const emptyContact: Contact = { id: "", name: "", avatar: "", relationship: "", personality: "", background: "", speakingStyle: "" };
const emptyConfig: Config = { provider: "openai-compatible", baseUrl: "", model: "", apiKey: "", fishApiKey: "", voiceId: "", speed: "1", pitch: "0" };
function read<T,>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}
export function AIContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() => read(CONTACTS_KEY, []));
  const [config, setConfig] = useState<Config>(() => read(CONFIG_KEY, emptyConfig));
  const [page, setPage] = useState<"list" | "edit" | "settings" | "chat">("list");
  const [draft, setDraft] = useState<Contact>(emptyContact);
  const [activeId, setActiveId] = useState("");
  const [saved, setSaved] = useState(false);
  const active = contacts.find(c => c.id === activeId);
  useEffect(() => { localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); }, [config]);
  const edit = (contact?: Contact) => { setDraft(contact ? { ...contact } : { ...emptyContact }); setPage("edit"); };
  const saveContact = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const item = { ...draft, id: draft.id || crypto.randomUUID() };
    setContacts(old => draft.id ? old.map(c => c.id === item.id ? item : c) : [...old, item]);
    setActiveId(item.id); setPage("list");
  };
  const saveConfig = () => { setSaved(true); window.setTimeout(() => setSaved(false), 1800); };
  const remove = (id: string) => { if (window.confirm("确定删除这个联系人吗？")) { setContacts(old => old.filter(c => c.id !== id)); if (activeId === id) setActiveId(""); } };
  return <div className="ai-contact-app">
    <style>{`
      .ai-contact-app{height:100%;min-height:0;display:flex;flex-direction:column;background:#f6f6f8;color:#202124;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow:hidden}
      .ai-head{height:54px;flex:none;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:rgba(255,255,255,.94);border-bottom:1px solid #e9e9ed}
      .ai-head strong{font-size:16px}.ai-head button,.ai-icon-btn{border:0;background:none;color:#2878d0;padding:7px;display:inline-flex;align-items:center;gap:5px}
      .ai-scroll{padding:16px;overflow:auto;flex:1}.ai-hero{padding:18px;border-radius:18px;background:linear-gradient(135deg,#e7efff,#f2eaff);margin-bottom:16px}
      .ai-hero h2{font-size:20px;margin:0 0 7px}.ai-hero p{margin:0;color:#626779;line-height:1.6;font-size:12px}
      .ai-primary{border:0;background:#2878d0;color:white;border-radius:12px;padding:11px 15px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:7px}
      .ai-card{display:flex;align-items:center;gap:12px;padding:13px;background:white;border-radius:15px;margin:9px 0;border:1px solid #ededf1}
      .ai-avatar{width:48px;height:48px;border-radius:50%;background:#e5eaf5;display:grid;place-items:center;font-size:20px;color:#58709a;overflow:hidden;flex:none}
      .ai-avatar img{width:100%;height:100%;object-fit:cover}.ai-card-main{min-width:0;flex:1}.ai-card-main b{display:block;font-size:15px}.ai-card-main small{display:block;color:#82838b;margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .ai-section{font-size:12px;color:#777b85;margin:18px 2px 8px}.ai-form{display:flex;flex-direction:column;gap:12px}
      .ai-field{display:flex;flex-direction:column;gap:6px;color:#535762;font-size:12px}.ai-field input,.ai-field textarea,.ai-field select{width:100%;box-sizing:border-box;border:1px solid #e1e2e7;border-radius:10px;background:white;padding:11px;color:#222;font:14px inherit;outline:none}
      .ai-field textarea{min-height:76px;resize:vertical;line-height:1.5}.ai-field input:focus,.ai-field textarea:focus{border-color:#6a9fe0}
      .ai-muted{font-size:11px;color:#888b94;line-height:1.55}.ai-row{display:flex;gap:9px}.ai-row>*{flex:1;min-width:0}
      .ai-danger{border:0;background:#fff0f0;color:#c44;border-radius:10px;padding:9px}.ai-empty{text-align:center;color:#8a8d96;padding:35px 10px;line-height:1.7}
      .ai-note{background:#fff8e8;color:#795c21;border:1px solid #f1dfb7;border-radius:11px;padding:11px;font-size:11px;line-height:1.6}
      .ai-chat-empty{background:white;border-radius:16px;padding:24px;text-align:center;color:#777;line-height:1.7}
    `}</style>
    <header className="ai-head">
      <button aria-label="返回" onClick={() => page === "list" ? undefined : setPage(page === "chat" ? "list" : "list")}><ArrowLeft size={19}/></button>
      <strong>{page === "settings" ? "AI 与声音设置" : page === "edit" ? (draft.id ? "编辑联系人" : "新建联系人") : page === "chat" ? (active?.name || "聊天") : "AI 联系人"}</strong>
      <button aria-label="设置" onClick={() => setPage("settings")}><Settings2 size={19}/></button>
    </header>
    {page === "list" && <main className="ai-scroll">
      <section className="ai-hero"><h2>把想象中的人带进手机</h2><p>创建联系人，设定他的性格、经历和说话方式。接入模型与声音服务后，就能开始真正的 AI 对话。</p></section>
      <button className="ai-primary" style={{width:"100%"}} onClick={() => edit()}><Plus size={17}/> 创建 AI 联系人</button>
      <div className="ai-section">我的联系人 · {contacts.length}</div>
      {contacts.length === 0 ? <div className="ai-empty"><UserRound size={32}/><br/>这里还没有联系人<br/>先创建一个角色吧。</div> : contacts.map(c => <article className="ai-card" key={c.id}>
        <div className="ai-avatar">{c.avatar ? <img src={c.avatar} alt=""/> : c.name.slice(0,1)}</div>
        <div className="ai-card-main"><b>{c.name}</b><small>{c.relationship || "还没有填写关系"} · {c.personality || "性格待设定"}</small></div>
        <button className="ai-icon-btn" onClick={() => {setActiveId(c.id);setPage("chat");}}><MessageCircle size={19}/></button>
        <button className="ai-icon-btn" onClick={() => edit(c)}><Settings2 size={18}/></button>
      </article>)}
    </main>}
    {page === "edit" && <main className="ai-scroll"><form className="ai-form" onSubmit={saveContact}>
      <label className="ai-field">联系人名称<input required maxLength={40} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="例如：林予安"/></label>
      <label className="ai-field">头像图片地址（可暂时留空）<input value={draft.avatar} onChange={e=>setDraft({...draft,avatar:e.target.value})} placeholder="https://..."/></label>
      <label className="ai-field">你们的关系<input value={draft.relationship} onChange={e=>setDraft({...draft,relationship:e.target.value})} placeholder="例如：朋友、恋人、偶像与粉丝"/></label>
      <label className="ai-field">性格设定<textarea value={draft.personality} onChange={e=>setDraft({...draft,personality:e.target.value})} placeholder="他的性格、优缺点、情绪表达方式……"/></label>
      <label className="ai-field">人物背景<textarea value={draft.background} onChange={e=>setDraft({...draft,background:e.target.value})} placeholder="成长经历、职业、生活细节、与你相识的经过……"/></label>
      <label className="ai-field">说话习惯<textarea value={draft.speakingStyle} onChange={e=>setDraft({...draft,speakingStyle:e.target.value})} placeholder="语气、常用词、称呼、回复长度、是否使用表情……"/></label>
      <button className="ai-primary" type="submit"><Save size={16}/> 保存联系人</button>
      {draft.id && <button type="button" className="ai-danger" onClick={()=>remove(draft.id)}><Trash2 size={15}/> 删除联系人</button>}
    </form></main>}
    {page === "settings" && <main className="ai-scroll">
      <div className="ai-note">当前先完成配置界面。真正调用 API 前还需要部署安全的后端代理；不要把真实 API Key 放进公开代码或截图发给别人。</div>
      <div className="ai-section">AI 文字模型</div>
      <div className="ai-form">
        <label className="ai-field">服务类型<select value={config.provider} onChange={e=>setConfig({...config,provider:e.target.value})}><option value="openai-compatible">OpenAI 兼容接口</option><option value="deepseek">DeepSeek</option><option value="siliconflow">硅基流动</option><option value="custom">自定义接口</option></select></label>
        <label className="ai-field">API Base URL<input value={config.baseUrl} onChange={e=>setConfig({...config,baseUrl:e.target.value})} placeholder="https://api.example.com/v1"/></label>
        <label className="ai-field">模型名称<input value={config.model} onChange={e=>setConfig({...config,model:e.target.value})} placeholder="例如 deepseek-chat"/></label>
        <label className="ai-field">API Key<input type="password" autoComplete="off" value={config.apiKey} onChange={e=>setConfig({...config,apiKey:e.target.value})} placeholder="暂不填写真实密钥"/></label>
      </div>
      <div className="ai-section">Fish Audio 语音</div>
      <div className="ai-form">
        <label className="ai-field">Fish Audio API Key<input type="password" autoComplete="off" value={config.fishApiKey} onChange={e=>setConfig({...config,fishApiKey:e.target.value})} placeholder="暂不填写真实密钥"/></label>
        <label className="ai-field">Voice ID<input value={config.voiceId} onChange={e=>setConfig({...config,voiceId:e.target.value})} placeholder="填写音色 ID"/></label>
        <div className="ai-row">
          <label className="ai-field">语速<input value={config.speed} onChange={e=>setConfig({...config,speed:e.target.value})} /></label>
          <label className="ai-field">音调<input value={config.pitch} onChange={e=>setConfig({...config,pitch:e.target.value})} /></label>
        </div>
      </div>
      <button className="ai-primary" style={{width:"100%",marginTop:16}} onClick={saveConfig}><Save size={16}/>{saved ? "已保存" : "保存设置"}</button>
      <p className="ai-muted">设置目前只保存在当前浏览器。下一阶段会把密钥迁移到后端安全存储，再启用真实 API 调用。</p>
    </main>}
    {page === "chat" && <main className="ai-scroll">
      <div className="ai-chat-empty"><div className="ai-avatar" style={{margin:"0 auto 12px"}}>{active?.avatar ? <img src={active.avatar} alt=""/> : active?.name.slice(0,1)}</div><b>{active?.name}</b><br/>联系人资料已创建。<br/>下一阶段接入模型 API 后，这里就能进行真正的 AI 对话。</div>
      <button className="ai-primary" style={{width:"100%",marginTop:14}} onClick={()=>edit(active)}>编辑人物设定</button>
      <button className="ai-icon-btn" style={{marginTop:10}} onClick={()=>setPage("settings")}><Volume2 size={16}/> 配置 AI 与声音</button>
    </main>}
  </div>;
}
