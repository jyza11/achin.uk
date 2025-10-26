<!-- src/routes/blog/+page.svelte -->
<script>
    import { onMount } from 'svelte';
    import articleContent from './article.js'; // Import from local file
    
    let shortText = '';
    let isLoading = true;
    
    // Extract first paragraph or limit words for preview
    function getShortText(fullText, wordLimit = 50) {
      const words = fullText.split(' ');
      if (words.length <= wordLimit) return fullText;
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    
    onMount(() => {
      // Process the article content
      shortText = getShortText(articleContent.content);
      isLoading = false;
    });
  </script>
  
  <svelte:head>
    <title>Blog - {articleContent.title}</title>
    <meta name="description" content={shortText} />
  </svelte:head>
  <div  flex flex-col items-center>
<!-- Debug your custom CSS setup -->
<div class="p-4" data-theme="custom-theme">
    <h2>Custom CSS Debug</h2>
    
    <!-- Test 1: Basic Tailwind (should always work) -->
    <div class="bg-blue-500 text-white p-2 mb-4 rounded">
      ✓ If BLUE: Tailwind base classes work
    </div>
    
    <!-- Test 2: Check if CSS custom properties exist -->
    <div id="custom-vars-test" class="mb-4 p-2 border">
      CSS Custom Properties test...
    </div>
    
    <!-- Test 3: Manual color testing with CSS variables -->
    <div style="background: var(--color-primary-500, red); color: white;" class="p-2 mb-2">
      If RED: --color-primary-500 missing | If other color: CSS vars work
    </div>
    
    <div style="color: var(--color-primary-500, red);" class="p-2 mb-2">
      This text should be primary color (or red if missing)
    </div>
    
    <!-- Test 4: Check what stylesheets are loaded -->
    <div id="stylesheet-info" class="mb-4 p-2 bg-gray-100 text-xs">
      Loaded stylesheets...
    </div>
    
    <!-- Test 5: Try Skeleton utility classes -->
    <div class="space-y-2">
      <p class="text-primary-500">text-primary-500 test</p>
      <p class="text-secondary-500">text-secondary-500 test</p>
      <button class="btn variant-filled-primary">Skeleton button test</button>
    </div>
  </div>
  
  <script>
    import { onMount } from 'svelte';
    
    onMount(() => {
      // Test CSS custom properties
      const customVarsDiv = document.getElementById('custom-vars-test');
      const root = getComputedStyle(document.documentElement);
      
      const testVars = [
        'color-primary-50',
        'color-primary-500', 
        'color-primary-900',
        'color-secondary-500',
        'color-surface-500',
        'theme-font-family-base',
        'theme-rounded-base'
      ];
      
      let varsResults = '<strong>CSS Custom Properties:</strong><br>';
      testVars.forEach(varName => {
        const value = root.getPropertyValue(`--${varName}`);
        const status = value ? '✓' : '✗';
        varsResults += `${status} --${varName}: <code>${value || 'MISSING'}</code><br>`;
      });
      
      customVarsDiv.innerHTML = varsResults;
      
      // Check loaded stylesheets
      const stylesheetDiv = document.getElementById('stylesheet-info');
      const stylesheets = Array.from(document.styleSheets);
      
      let stylesheetInfo = '<strong>Loaded Stylesheets:</strong><br>';
      stylesheets.forEach((sheet, index) => {
        try {
          const href = sheet.href || 'inline styles';
          stylesheetInfo += `${index + 1}. ${href}<br>`;
        } catch (e) {
          stylesheetInfo += `${index + 1}. [blocked by CORS]<br>`;
        }
      });
      
      stylesheetDiv.innerHTML = stylesheetInfo;
    });
  </script>
  <main class="card preset-filled-surface-100-900 
  border-[1px] border-surface-200-800 card-hover divide-surface-200-800 block 
  max-w-md divide-y overflow-hidden">
    <header class="space-y-4 p-4">
      <h1>{articleContent.title}</h1>
      {#if articleContent.author}
        <p class="author">By {articleContent.author}</p>
      {/if}
      {#if articleContent.publishDate}
        <time class="publish-date">{articleContent.publishDate}</time>
      {/if}
    </header>
    
    <article class="space-y-4 p-4">
      {#if isLoading}
        <p class="loading">讀取中...</p>
      {:else}
        <p class="article-preview">{shortText}</p>
        
        <!-- Optional: Show full content toggle -->
        <button 
          class="card p-4 preset-filled-error-500-500 "
          on:click={() => {
            // Toggle between short and full content
            if (shortText.includes('...')) {
              shortText = articleContent.content;
            } else {
              shortText = getShortText(articleContent.content);
            }
          }}
        >
          {shortText.includes('...') ? '繼續閱讀' : 'Show Less'}
        </button>
      {/if}
    </article>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Standard Colors -->
        <div class="bg-primary-900 text-primary-contrast-500">
          <p class="text-center p-4">Standard Colors</p>
        </div>
        <!-- Color Pairings -->
        <div class="bg-secondary-200-800 text-secondary-contrast-200-800">
          <p class="text-center p-4">Color Pairings</p>
        </div>
      </div>
  </main>
  
  </div>
  <!-- No custom styles needed - using Skeleton + Tailwind utility classes -->