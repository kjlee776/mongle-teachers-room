"use client";

import { useState, useEffect } from "react";

type Menu = {
  id: number;
  title: string;
  type: string;
  url: string;
};

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus");
      const data = await res.json();
      setMenus(data);
      if (data.length > 0 && !activeMenuId) {
        setActiveMenuId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeMenu = menus.find((m) => m.id === activeMenuId);

  const toggleLogin = async () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    const password = prompt("관리자 비밀번호를 입력하세요:");
    if (!password) return;

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        alert("관리자 권한을 얻었습니다.");
      } else {
        alert("비밀번호가 틀렸습니다.");
      }
    } catch (e) {
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleAddMenu = async () => {
    if (!isAdmin) return;
    const title = prompt("새 메뉴의 이름을 입력하세요:", "새 메뉴");
    if (!title) return;
    const url = prompt("연결할 URL을 입력하세요:", "https://");
    if (!url) return;
    const type = title.includes("페이지") ? "internal" : "external";

    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, type })
      });
      if (res.ok) {
        const newMenu = await res.json();
        setMenus([...menus, newMenu]);
      } else {
        alert("메뉴 추가 실패");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!isAdmin || !confirm("정말 이 메뉴를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/menus/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setMenus(menus.filter(m => m.id !== id));
        if (activeMenuId === id) {
          setActiveMenuId(menus.length > 1 ? menus.find(m => m.id !== id)?.id || null : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container">
      {/* 1. Top Header */}
      <header className="pane-header">
        <div className="header-title">
          <span className="header-title-icon">☁️</span>
          몽글몽글 교무실
        </div>
        <div className="header-actions">
          {isAdmin ? (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "var(--color-accent)" }}>관리자 모드</span>
              <button className="btn" onClick={toggleLogin}>로그아웃</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={toggleLogin}>관리자 로그인</button>
          )}
        </div>
      </header>

      {/* 2. Left Sidebar (Menus) */}
      <nav className="pane-nav">
        <div className="nav-header">
          <span>메뉴</span>
          {isAdmin && (
            <button className="icon-button" onClick={handleAddMenu} title="메뉴 추가">
              ┼
            </button>
          )}
        </div>
        <ul className="menu-list">
          {isLoading ? (
            <li className="menu-item" style={{ color: "var(--color-text-secondary)" }}>로딩 중...</li>
          ) : menus.length === 0 ? (
            <li className="menu-item" style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>등록된 메뉴가 없습니다.</li>
          ) : menus.map((menu) => (
            <li
              key={menu.id}
              className={`menu-item ${activeMenuId === menu.id ? "active" : ""}`}
              onClick={() => setActiveMenuId(menu.id)}
            >
              <span className="menu-icon">
                {menu.type === "external" ? "🔗" : "📄"}
              </span>
              {menu.title}
              {isAdmin && (
                <button 
                  className="icon-button" 
                  style={{ marginLeft: "auto", width: "24px", height: "24px", fontSize: "12px", display: "inline-flex" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMenu(menu.id);
                  }}
                  title="삭제"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* 3. Center Content (Main) */}
      <main className="pane-main">
        <div className="main-content-frame">
          {activeMenu ? (
            activeMenu.type === "external" ? (
              <iframe 
                src={activeMenu.url} 
                className="content-iframe"
                title={activeMenu.title}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            ) : (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
                <h2 style={{ color: "var(--color-text-primary)", marginBottom: "16px" }}>{activeMenu.title}</h2>
                <div style={{ padding: "24px", backgroundColor: "var(--color-bg-primary)", borderRadius: "8px", display: "inline-block", textAlign: "left" }}>
                  <p><strong>URL 연결:</strong> {activeMenu.url}</p>
                  <p style={{ marginTop: "12px" }}>위 URL이 외부 사이트라면 메뉴 추가 시 제목에 "페이지"라는 단어를 빼고 생성해보세요. <br/>그러면 iframe으로 렌더링 됩니다.</p>
                </div>
              </div>
            )
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
              {isLoading ? "로딩 중..." : "왼쪽 메뉴를 선택해주세요."}
            </div>
          )}
        </div>
      </main>

      {/* 4. Right Sidebar (Workspace) */}
      <aside className="pane-aside">
        <div className="aside-header">
          <span>📂</span> 작업 공간
        </div>
        <div className="aside-content">
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
            진행중인 업무 및 참고 자료 (샘플)
          </p>
          
          <div className="workspace-item">
            <span>📝</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>수업 지도안.pdf</span>
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>최근 수정: 오늘</span>
            </div>
          </div>

          <div className="workspace-item">
            <span>📊</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>학생 성적 통계.xlsx</span>
              <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>최근 수정: 어제</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 5. Bottom (Chat) */}
      <div className="pane-chat">
        <div className="chat-container">
          <div className="chat-input-wrapper">
            <textarea
              className="chat-input"
              placeholder="무엇을 도와드릴까요? (NotebookLM 방식 대화)"
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (chatInput.trim()) {
                    alert(`[샘플] AI 응답 시뮬레이션: "${chatInput}"에 대한 분석을 시작합니다.`);
                    setChatInput('');
                  }
                }
              }}
            />
          </div>
          <div className="chat-actions">
            <button className="icon-button" title="파일 첨부">📎</button>
            <button 
              className="btn btn-primary" 
              style={{ borderRadius: "20px", padding: "6px 16px" }}
              onClick={() => {
                if (chatInput.trim()) {
                  alert(`[샘플] AI 응답 시뮬레이션: "${chatInput}"에 대한 분석을 시작합니다.`);
                  setChatInput('');
                }
              }}
            >
              전송 ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
