import { test, expect } from '../../fixtures/auth.fixture';
import { env } from '../../config/env';
import tags from '../../test-data/tags.json';

// These tests need an API. Envs without API_URL skip them.
test.skip(!env.apiUrl, `No API_URL configured for env '${env.name}'`);

test('Mocking APIs Response @api @mockingAPI', async ({ page }) => {
  // Mock: the request never reaches the server
  await page.route('*/**/api/tags', async (route) => {
    await route.fulfill({ json: tags });
  });

  // Intercept: the request goes to the server, then we modify the response
  await page.route('*/**/api/articles*', async (route) => {
    const response = await route.fetch();
    const responseJson = await response.json();
    responseJson.articles[0].title = 'mocking API title ';
    responseJson.articles[0].description = 'testing mocking intercept api response through description';
    await route.fulfill({ json: responseJson });
  });

  await page.goto('/');

  // Assertions are mandatory, otherwise the page may not have used the mocked responses yet
  await expect(page.locator('.sidebar .tag-pill')).toContainText(['Automation', 'Playwright']);
  await expect(page.locator('.preview-link h1').first()).toContainText('mocking API title');
  await expect(page.locator('.preview-link p').first()).toContainText(
    'testing mocking intercept api response through description',
  );
});

test('Create article @api @apiE2E', async ({ page, api }) => {
  test.skip(env.authMode === 'none', 'Needs auth — skipped when API_AUTH=none');

  // Browser is already logged in via storageState from auth.setup.ts
  await page.goto('/');

  await page.getByText('New Article').click();
  await page.getByRole('textbox', { name: 'Article Title' }).fill('Playwright is awesome');
  await page.getByRole('textbox', { name: "What's this article about?" }).fill('We can use APIs in Playwright');
  await page
    .getByRole('textbox', { name: 'Write your article (in markdown)' })
    .fill('Automate any web application in Playwright');

  const createArticleResponsePromise = page.waitForResponse(`${env.apiUrl}/articles/`);
  await page.getByRole('button', { name: 'Publish Article' }).click();
  const articleResponseJSON = await (await createArticleResponsePromise).json();
  const slugID = articleResponseJSON.article.slug;

  await expect(page.locator('.article-page h1')).toContainText('Playwright is awesome');
  await page.getByText('Home').first().click();
  await expect(page.locator('.article-preview h1').first()).toContainText('Playwright is awesome');

  // Clean up with the saved token, so no second login is needed
  const deleteResponse = await api.delete(`articles/${slugID}`);
  expect(deleteResponse.status()).toEqual(204);
});
