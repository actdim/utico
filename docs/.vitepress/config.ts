import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

const GITHUB_REPO = 'https://github.com/actdim/utico';

export default withMermaid(
  defineConfig({
    base: '/utico/',
    title: 'Utico',
    description: 'Foundational TypeScript utility toolkit: type metaprogramming, concurrency locks, and persistent storage',
    cleanUrls: true,
    lastUpdated: true,
    ignoreDeadLinks: true,

    rewrites: {
      'INDEX.md': 'index.md'
    },

    markdown: {
      config: (md) => {
        const defaultRender =
          md.renderer.rules.link_open ||
          function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
          };

        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
          const token = tokens[idx];
          const hrefIndex = token.attrIndex('href');
          if (hrefIndex >= 0) {
            const href = token.attrs![hrefIndex][1];
            if (href.startsWith('../')) {
              token.attrs![hrefIndex][1] = `${GITHUB_REPO}/blob/main/${href.slice(3)}`;
            }
          }
          return defaultRender(tokens, idx, options, env, self);
        };
      }
    },

    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Architecture', link: '/topic--architecture' },
        { text: 'Domain Model', link: '/topic--domain-model' },
        { text: 'API Reference', link: '/topic--04-api-reference' },
        { text: 'Patterns', link: '/topic--05-patterns-and-recipes' },
        { text: 'License', link: '/topic--license' },
        { text: 'GitHub', link: GITHUB_REPO }
      ],

      sidebar: [
        {
          text: 'Architecture & Specifications',
          items: [
            { text: 'Knowledge Base Index', link: '/' },
            { text: '01 System Architecture', link: '/topic--architecture' },
            { text: '02 Domain Model', link: '/topic--domain-model' }
          ]
        },
        {
          text: 'API & Recipes',
          items: [
            { text: '04 API Reference', link: '/topic--04-api-reference' },
            { text: '05 Patterns & Recipes', link: '/topic--05-patterns-and-recipes' }
          ]
        },
        {
          text: 'Development & Operations',
          items: [
            { text: '03 Setup & Workflow', link: '/topic--setup-and-workflow' },
            { text: 'License', link: '/topic--license' }
          ]
        }
      ],

      search: {
        provider: 'local'
      },

      socialLinks: [
        { icon: 'github', link: GITHUB_REPO }
      ],

      editLink: {
        pattern: `${GITHUB_REPO}/edit/main/docs/:path`,
        text: 'Edit this page on GitHub'
      },

      footer: {
        message: 'Released under Proprietary License.',
        copyright: 'Copyright (c) 2025-2026 Pavel Borodaev'
      }
    },

    mermaid: {
      theme: 'default'
    }
  })
);
