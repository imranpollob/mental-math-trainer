<template>
  <footer class="footer">
    <div class="footer__container">
      <p class="footer__credit">
        Designed &amp; built by
        <a href="https://github.com/imranpollob" target="_blank" rel="noopener noreferrer" class="footer__author">
          Imran Pollob
        </a>
      </p>

      <div class="footer__meta">
        <a
          href="https://github.com/imranpollob/mental-math-trainer"
          target="_blank"
          rel="noopener noreferrer"
          class="footer__icon-link"
          title="GitHub Repository"
          aria-label="GitHub Repository"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  padding: 12px 20px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

.footer__container {
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.footer__credit {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  font-size: var(--font-size-xs);
}

.footer__author {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.footer__author:hover {
  color: var(--color-primary-hover);
}

.footer__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-xs);
}

.footer__icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: color 0.15s ease, transform 0.15s ease;
}

.footer__icon-link:hover {
  color: var(--color-primary);
  transform: translateY(-1px);
}

.footer__sep {
  opacity: 0.5;
}

@media (max-width: 640px) {
  .footer {
    padding: 10px 14px;
  }
  .footer__container {
    justify-content: center;
    text-align: center;
  }
}
</style>
