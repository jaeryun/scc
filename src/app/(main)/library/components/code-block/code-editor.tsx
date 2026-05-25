'use client';

import { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { StreamLanguage } from '@codemirror/language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const configLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.match(/^#.*/)) return 'comment';
    if (stream.match(/^[A-Za-z0-9_.-]+/)) return 'keyword';
    if (stream.match(/=/)) return 'operator';
    if (stream.match(/[0-9]+/)) return 'number';
    stream.next();
    return null;
  }
});

const INITIAL_CODE = `# /etc/sysctl.conf

# 네트워크 튜닝
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1

# Keepalive 설정
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 5

# 파일 디스크립터 & 메모리
fs.file-max = 2097152
fs.inotify.max_user_watches = 524288
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# 커널 보안
kernel.core_uses_pid = 1
kernel.pid_max = 4194304
kernel.msgmnb = 65536
kernel.msgmax = 65536

# BBR 혼잡 제어 (고속 네트워크)
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr`;

export function CodeEditor() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [saved, setSaved] = useState(true);

  const handleChange = useCallback((value: string) => {
    setCode(value);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    toast.success('저장되었습니다.');
    setSaved(true);
  }, []);

  const handleCopy = useCallback(() => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    toast.success('클립보드에 복사되었습니다.');
  }, [code]);

  const lines = code.split('\n').length;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>CodeMirror Editor</CardTitle>
            <CardDescription>
              @uiw/react-codemirror + one-dark 테마 — OS 설정 파일 편집 예시
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={handleCopy}>
              복사
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setCode(INITIAL_CODE);
                setSaved(true);
              }}
            >
              초기화
            </Button>
            <Button size='sm' onClick={handleSave} disabled={saved}>
              저장
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='overflow-hidden rounded-lg border'>
          <div className='flex items-center gap-3 border-b bg-[#282c34] px-4 py-2'>
            <div className='flex items-center gap-2'>
              <span className='size-3 rounded-full bg-[#ff5f57]' />
              <span className='size-3 rounded-full bg-[#febc2e]' />
              <span className='size-3 rounded-full bg-[#28c840]' />
            </div>
            <span className='font-mono text-xs text-white/60'>/etc/sysctl.conf</span>
            {!saved && <span className='font-mono text-[11px] text-white/30'>●</span>}
          </div>
          <CodeMirror
            value={code}
            height='420px'
            theme={oneDark}
            extensions={[configLanguage]}
            onChange={handleChange}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              indentOnInput: true
            }}
          />
          <div className='flex items-center justify-between border-t bg-[#282c34] px-4 py-1.5'>
            <div className='flex items-center gap-4'>
              <span className='font-mono text-[11px] text-white/40'>conf</span>
              <span className='font-mono text-[11px] text-white/40'>UTF-8</span>
            </div>
            <div className='flex items-center gap-4 font-mono text-[11px] text-white/40'>
              <span>Ln {lines}</span>
              <span>{code.length} chars</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
