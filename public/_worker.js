// public/_worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/draws")) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      }
      const kvStore = env.LOTTO_KV || env.LOTTO289;
      if (!kvStore) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "LOTTO_KV or LOTTO289 binding not configured on Cloudflare"
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            },
            status: 200
          }
        );
      }
      if (request.method === "GET") {
        const key = url.searchParams.get("key");
        if (key) {
          const data = await kvStore.get(key, "text");
          return new Response(
            JSON.stringify({ success: true, key, data: data ? JSON.parse(data) : null }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }
        const keys = [
          "lotto_data_nikkei_morning",
          "lotto_data_nikkei_afternoon",
          "lotto_data_china_morning",
          "lotto_data_china_afternoon",
          "lotto_data_hangseng_morning",
          "lotto_data_hangseng_afternoon",
          "lotto_data_nikkei_vip_morning",
          "lotto_data_nikkei_vip_afternoon",
          "lotto_data_china_vip_morning",
          "lotto_data_china_vip_afternoon",
          "lotto_data_hangseng_vip_morning",
          "lotto_data_hangseng_vip_afternoon",
          "lotto_data_nikkei",
          "lotto_data_stock_vip",
          "lotto_data_laos",
          "lotto_data_hanoi_special",
          "lotto_data_hanoi",
          "lotto_data_hanoi_vip",
          "lotto_data_gsb",
          "lotto_data_gov"
        ];
        const result = {};
        for (const k of keys) {
          const val = await kvStore.get(k, "text");
          if (val) {
            try {
              result[k] = JSON.parse(val);
            } catch (e) {
              result[k] = null;
            }
          }
        }
        return new Response(
          JSON.stringify({ success: true, datasets: result }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
      if (request.method === "POST") {
        try {
          const body = await request.json();
          const { key, data } = body;
          if (!key || !data) {
            return new Response(
              JSON.stringify({ success: false, message: "Missing key or data" }),
              {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                },
                status: 400
              }
            );
          }
          await kvStore.put(key, JSON.stringify(data));
          return new Response(
            JSON.stringify({ success: true, message: `Saved ${key} to Cloudflare KV` }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              },
              status: 500
            }
          );
        }
      }
    }
    if (url.pathname.startsWith("/api/proxy")) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
          }
        });
      }
      const targetUrl = url.searchParams.get("url");
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: "Missing target url parameter" }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      try {
        const res = await fetch(targetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*"
          }
        });
        const body = await res.text();
        return new Response(body, {
          status: res.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || "Proxy fetch failed" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }
    if (url.pathname.startsWith("/api/line")) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
          }
        });
      }
      const kvStore = env.LOTTO_KV || env.LOTTO289;

      // GET /api/line/config
      if (url.pathname === "/api/line/config" && request.method === "GET") {
        let config = null;
        if (kvStore) {
          const raw = await kvStore.get("line_bot_config", "text");
          if (raw) {
            try { config = JSON.parse(raw); } catch (e) {}
          }
        }
        return new Response(
          JSON.stringify({
            success: true,
            config: config || {
              channelAccessToken: "",
              targetId: "U3a7529a26c7c9a1a06d4cd374349a33c",
              enabled: true
            }
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }

      // POST /api/line/config
      if (url.pathname === "/api/line/config" && request.method === "POST") {
        try {
          const body = await request.json();
          if (kvStore && body) {
            await kvStore.put("line_bot_config", JSON.stringify(body));
          }
          return new Response(
            JSON.stringify({ success: true, message: "LINE Bot configuration saved" }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              },
              status: 500
            }
          );
        }
      }

      // POST /api/line/webhook (รับ Event จาก LINE เพื่ออ่าน groupId อัตโนมัติ)
      if (url.pathname === "/api/line/webhook" && request.method === "POST") {
        try {
          const body = await request.json();
          const events = body.events || [];
          for (const ev of events) {
            const groupId = ev.source && ev.source.groupId;
            if (groupId && kvStore) {
              const raw = await kvStore.get("line_bot_config", "text");
              const cfg = raw ? JSON.parse(raw) : {};
              cfg.targetId = groupId;
              cfg.lastDetectedGroupId = groupId;
              await kvStore.put("line_bot_config", JSON.stringify(cfg));

              const userMsg = (ev.message && ev.message.text ? ev.message.text.trim() : '');
              const isAskingId = userMsg === 'รหัสกลุ่ม' || userMsg === '#groupid' || userMsg === '/id' || userMsg === 'idกลุ่ม';

              if (isAskingId && cfg.channelAccessToken && ev.replyToken) {
                await fetch("https://api.line.me/v2/bot/message/reply", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cfg.channelAccessToken}`
                  },
                  body: JSON.stringify({
                    replyToken: ev.replyToken,
                    messages: [
                      {
                        type: "text",
                        text: `รหัสกลุ่มนี้คือ:\n${groupId}\n\n(ระบบได้บันทึกรหัสกลุ่มนี้ไว้ให้อัตโนมัติแล้วครับ)`
                      }
                    ]
                  })
                }).catch(() => {});
              }
            }
          }
          return new Response("OK", { status: 200 });
        } catch (e) {
          return new Response("OK", { status: 200 });
        }
      }

      // POST /api/line/send
      if (url.pathname === "/api/line/send" && request.method === "POST") {
        try {
          const body = await request.json();
          let { message, to, token } = body;

          if (!token && kvStore) {
            const raw = await kvStore.get("line_bot_config", "text");
            if (raw) {
              const cfg = JSON.parse(raw);
              token = cfg.channelAccessToken;
              if (!to) to = cfg.targetId;
            }
          }

          if (!to) to = "U3a7529a26c7c9a1a06d4cd374349a33c";
          if (!token) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "กรุณาระบุ Channel Access Token ในการตั้งค่า LINE ก่อนส่งข้อความ"
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                },
                status: 400
              }
            );
          }

          if (!message) {
            return new Response(
              JSON.stringify({ success: false, error: "ข้อความว่างเปล่า" }),
              {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                },
                status: 400
              }
            );
          }

          const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              to: to,
              messages: [
                {
                  type: "text",
                  text: message
                }
              ]
            })
          });

          const lineJson = await lineRes.json().catch(() => ({}));
          if (!lineRes.ok) {
            return new Response(
              JSON.stringify({
                success: false,
                status: lineRes.status,
                error: lineJson.message || `LINE API error: ${lineRes.statusText}`,
                details: lineJson
              }),
              {
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                },
                status: 200
              }
            );
          }

          return new Response(
            JSON.stringify({ success: true, message: "ส่งแจ้งเตือนเข้า LINE สำเร็จแล้ว!", to }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, error: err.message }),
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              },
              status: 500
            }
          );
        }
      }
    }
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=_worker.js.map

