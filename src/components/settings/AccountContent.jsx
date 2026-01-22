import { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LogIn } from 'lucide-react';
import ClaudeLogo from '../ClaudeLogo';
import CursorLogo from '../CursorLogo';
import CodexLogo from '../CodexLogo';
import { useTranslation } from 'react-i18next';
import { authenticatedFetch } from '../../utils/api';

const agentConfig = {
  claude: {
    name: 'Claude',
    description: 'Anthropic Claude AI assistant',
    Logo: ClaudeLogo,
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    borderClass: 'border-blue-200 dark:border-blue-800',
    textClass: 'text-blue-900 dark:text-blue-100',
    subtextClass: 'text-blue-700 dark:text-blue-300',
    buttonClass: 'bg-blue-600 hover:bg-blue-700',
  },
  cursor: {
    name: 'Cursor',
    description: 'Cursor AI-powered code editor',
    Logo: CursorLogo,
    bgClass: 'bg-purple-50 dark:bg-purple-900/20',
    borderClass: 'border-purple-200 dark:border-purple-800',
    textClass: 'text-purple-900 dark:text-purple-100',
    subtextClass: 'text-purple-700 dark:text-purple-300',
    buttonClass: 'bg-purple-600 hover:bg-purple-700',
  },
  codex: {
    name: 'Codex',
    description: 'OpenAI Codex AI assistant',
    Logo: CodexLogo,
    bgClass: 'bg-gray-100 dark:bg-gray-800/50',
    borderClass: 'border-gray-300 dark:border-gray-600',
    textClass: 'text-gray-900 dark:text-gray-100',
    subtextClass: 'text-gray-700 dark:text-gray-300',
    buttonClass: 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600',
  },
};

export default function AccountContent({ agent, authStatus, onLogin }) {
  const { t } = useTranslation('settings');
  const config = agentConfig[agent];
  const { Logo } = config;

  const [codexHealth, setCodexHealth] = useState({
    loading: false,
    data: null,
    error: null,
    updatedAt: null
  });

  const fetchCodexHealth = useCallback(async () => {
    setCodexHealth((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const resp = await authenticatedFetch('/api/codex/health');
      const json = await resp.json().catch(() => null);
      if (!resp.ok || !json?.success) {
        const errorText = json?.error || json?.details || json?.message || `HTTP ${resp.status}`;
        setCodexHealth({ loading: false, data: null, error: errorText, updatedAt: new Date() });
        return;
      }
      setCodexHealth({ loading: false, data: json, error: null, updatedAt: new Date() });
    } catch (e) {
      setCodexHealth({ loading: false, data: null, error: e?.message || String(e), updatedAt: new Date() });
    }
  }, []);

  useEffect(() => {
    if (agent === 'codex') {
      fetchCodexHealth();
    }
  }, [agent, fetchCodexHealth]);

  const renderCodexHealth = () => {
    if (agent !== 'codex') return null;

    const data = codexHealth.data;
    const cliAvailable = !!data?.cli?.available;
    const hasOpenAIKey = !!data?.env?.hasOpenAIKey;
    const sessionsExists = !!data?.sessionsDir?.exists;
    const configExists = !!data?.config?.exists;
    const jsonlCount = data?.sessionsDir?.jsonlFiles?.count ?? null;
    const jsonlTruncated = !!data?.sessionsDir?.jsonlFiles?.truncated;
    const jsonlLimit = data?.sessionsDir?.jsonlFiles?.limit ?? null;

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium text-foreground">{t('agents.codexHealth.title')}</div>
            <div className="text-sm text-muted-foreground">
              {codexHealth.updatedAt
                ? t('agents.codexHealth.lastUpdated', { time: codexHealth.updatedAt.toLocaleString() })
                : t('agents.codexHealth.notChecked')}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCodexHealth} disabled={codexHealth.loading}>
            {codexHealth.loading ? t('agents.codexHealth.checking') : t('agents.codexHealth.refresh')}
          </Button>
        </div>

        {codexHealth.error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {t('agents.codexHealth.error', { error: codexHealth.error })}
          </div>
        )}

        {data && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('agents.codexHealth.items.cli')}</span>
              <span className="flex items-center gap-2">
                <Badge variant={cliAvailable ? 'success' : 'secondary'}>
                  {cliAvailable ? t('agents.codexHealth.status.ok') : t('agents.codexHealth.status.missing')}
                </Badge>
                {cliAvailable && data?.cli?.version ? (
                  <span className="font-mono text-xs text-muted-foreground">{data.cli.version}</span>
                ) : null}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('agents.codexHealth.items.openAIKey')}</span>
              <Badge variant={hasOpenAIKey ? 'success' : 'secondary'}>
                {hasOpenAIKey ? t('agents.codexHealth.status.ok') : t('agents.codexHealth.status.missing')}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('agents.codexHealth.items.sessionsDir')}</span>
              <span className="flex items-center gap-2">
                <Badge variant={sessionsExists ? 'success' : 'secondary'}>
                  {sessionsExists ? t('agents.codexHealth.status.ok') : t('agents.codexHealth.status.missing')}
                </Badge>
                {typeof jsonlCount === 'number' ? (
                  <span className="text-xs text-muted-foreground">
                    {t('agents.codexHealth.jsonlCount', { count: jsonlCount })}
                    {jsonlTruncated && jsonlLimit ? t('agents.codexHealth.truncated', { limit: jsonlLimit }) : ''}
                  </span>
                ) : null}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t('agents.codexHealth.items.configFile')}</span>
              <Badge variant={configExists ? 'success' : 'secondary'}>
                {configExists ? t('agents.codexHealth.status.ok') : t('agents.codexHealth.status.missing')}
              </Badge>
            </div>

            {(!cliAvailable || !hasOpenAIKey) && (
              <div className="pt-2 text-xs text-muted-foreground">
                {t('agents.codexHealth.hints.title')}
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  {!cliAvailable ? <li>{t('agents.codexHealth.hints.cli')}</li> : null}
                  {!hasOpenAIKey ? <li>{t('agents.codexHealth.hints.openAIKey')}</li> : null}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Logo className="w-6 h-6" />
        <div>
          <h3 className="text-lg font-medium text-foreground">{config.name}</h3>
          <p className="text-sm text-muted-foreground">{t(`agents.account.${agent}.description`)}</p>
        </div>
      </div>

      <div className={`${config.bgClass} border ${config.borderClass} rounded-lg p-4`}>
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className={`font-medium ${config.textClass}`}>
                {t('agents.connectionStatus')}
              </div>
              <div className={`text-sm ${config.subtextClass}`}>
                {authStatus?.loading ? (
                  t('agents.authStatus.checkingAuth')
                ) : authStatus?.authenticated ? (
                  t('agents.authStatus.loggedInAs', { email: authStatus.email || t('agents.authStatus.authenticatedUser') })
                ) : (
                  t('agents.authStatus.notConnected')
                )}
              </div>
            </div>
            <div>
              {authStatus?.loading ? (
                <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                  {t('agents.authStatus.checking')}
                </Badge>
              ) : authStatus?.authenticated ? (
                <Badge variant="success" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {t('agents.authStatus.connected')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  {t('agents.authStatus.disconnected')}
                </Badge>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${config.textClass}`}>
                  {authStatus?.authenticated ? t('agents.login.reAuthenticate') : t('agents.login.title')}
                </div>
                <div className={`text-sm ${config.subtextClass}`}>
                  {authStatus?.authenticated
                    ? t('agents.login.reAuthDescription')
                    : t('agents.login.description', { agent: config.name })}
                </div>
              </div>
              <Button
                onClick={onLogin}
                className={`${config.buttonClass} text-white`}
                size="sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {authStatus?.authenticated ? t('agents.login.reLoginButton') : t('agents.login.button')}
              </Button>
            </div>
          </div>

          {authStatus?.error && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-sm text-red-600 dark:text-red-400">
                {t('agents.error', { error: authStatus.error })}
              </div>
            </div>
          )}
        </div>
      </div>

      {renderCodexHealth()}
    </div>
  );
}
