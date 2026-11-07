import { registerApplication, start, LifeCycles, navigateToUrl, addErrorHandler } from "single-spa";
import { constructApplications, constructRoutes, constructLayoutEngine } from "single-spa-layout";

const layoutElement = document.getElementById('single-spa-layout') as HTMLTemplateElement;
if (!layoutElement) throw new Error('Single-SPA layout template not found.');

const routes = constructRoutes(layoutElement);
const applications = constructApplications({
  routes,
  loadApp: ({ name }: { name: string }) => System.import(name) as Promise<LifeCycles>
});
const layoutEngine = constructLayoutEngine({ routes, applications, active: true });
const protectedRoutes = ['/cms-root-orchestration/editorial', '/cms-root-orchestration/collab', '/cms-root-orchestration/media'];
const failureState = new Map<string, string>();

function getValidSession(): any | null {
  const platform = (window as any).CMSPlatform;
  if (platform) return platform.getSession();
  try {
    const raw = localStorage.getItem('cms_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.user || !session.user.id || !session.expiresAt || session.expiresAt <= Date.now()) {
      localStorage.removeItem('cms_session');
      return null;
    }
    return session;
  } catch (_) {
    localStorage.removeItem('cms_session');
    return null;
  }
}

function enforceAuthentication(): void {
  const path = window.location.pathname;
  const requiresAuthentication = protectedRoutes.some(route => path === route || path.startsWith(route + '/'));
  if (requiresAuthentication && !getValidSession()) navigateToUrl('/cms-root-orchestration/auth');
}

function showModuleFailure(event: any): void {
  const appName = event && event.appOrParcelName ? String(event.appOrParcelName) : 'A CMS module';
  const message = event && event.message ? String(event.message) : 'The module could not be loaded.';
  failureState.set(appName, message);
  window.dispatchEvent(new CustomEvent('cms:shell:module-error', { detail: { appName, message } }));
}

addErrorHandler(showModuleFailure);
window.addEventListener('single-spa:before-routing-event', enforceAuthentication);
window.addEventListener('storage', enforceAuthentication);
window.addEventListener('cms:auth:expired', enforceAuthentication);
window.addEventListener('cms:auth:logout', enforceAuthentication);
window.addEventListener('cms:shell:module-retry', (event: Event) => {
  const name = (event as CustomEvent).detail && (event as CustomEvent).detail.appName;
  if (name) { failureState.delete(name); window.location.reload(); }
});
enforceAuthentication();
applications.forEach(registerApplication);
layoutEngine.activate();
start({ urlRerouteOnly: true });
