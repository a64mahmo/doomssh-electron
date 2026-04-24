import { test, expect } from '@playwright/test';
import { mockElectronBridge } from '../support/mocks';

test.beforeEach(async ({ page }) => {
  await mockElectronBridge(page);
  
  // Override vault mocks to provide data
  await page.addInitScript(() => {
    const win = (window as any);
    const originalVault = win.electron.vault;
    
    // Base settings to reuse
    const mockSettings = {
      fontFamily: 'Inter',
      fontSize: 11,
      lineHeight: 1.5,
      accentColor: '#4f46e5',
      textColor: '#1a1a1a',
      backgroundColor: '#ffffff',
      marginHorizontal: 15,
      marginVertical: 15,
      entrySpacing: 1.0,
      sectionSpacing: 1.0,
      entryLayout: 'date-location-right',
      columnWidthMode: 'auto',
      columnWidth: 30,
      titleSize: 'M',
      subtitleStyle: 'normal',
      subtitlePlacement: 'next-line',
      indentBody: false,
      listStyle: 'bullet',
      colorMode: 'basic',
      themeColorStyle: 'basic',
      applyAccentName: true,
      applyAccentJobTitle: false,
      applyAccentHeadings: true,
      applyAccentHeadingLine: true,
      applyAccentHeaderIcons: false,
      applyAccentDotsBarsBubbles: false,
      applyAccentDates: false,
      applyAccentEntrySubtitle: false,
      applyAccentLinkIcons: true,
      columnLayout: 'one',
      headerAlignment: 'left',
      detailsPosition: 'below',
      detailsArrangement: 'wrap',
      sectionHeadingStyle: 'underline',
      debugMode: false,
      footerPageNumbers: false,
      footerEmail: false,
      footerName: false,
      skillDisplay: 'bubbles',
      skillColumns: 3,
      educationOrder: 'newest-first',
      experienceOrder: 'newest-first',
      groupPromotions: true,
      titleBold: true,
      sectionSpacing: 1.0,
      sectionColumns: {}
    };

    win.electron.vault = {
      ...originalVault,
      read: (id: string) => {
        if (id === 'cl-1') {
          return Promise.resolve({
            id: 'cl-1',
            name: 'Targeted Letter',
            kind: 'coverLetter',
            template: 'modern',
            settings: mockSettings,
            sections: [{ id: 'h1', type: 'header', title: 'Details', visible: true, items: { fullName: 'John Doe' } }],
            coverLetter: {
              syncWithResume: false,
              date: '2024-04-23',
              recipient: { hrName: 'Jane Smith', company: 'Acme Corp', address: '' },
              body: 'I am excited to apply...',
              signature: { fullName: 'John Doe', place: 'NY', date: '2024-04-23' }
            }
          });
        }
        return Promise.resolve({
          id,
          name: 'Master Resume',
          kind: 'resume',
          template: 'crisp',
          settings: mockSettings,
          sections: [{ id: 'rh1', type: 'header', title: 'Details', visible: true, items: { fullName: 'John Doe' } }]
        });
      },
      list: () => Promise.resolve([
        { 
          id: 'cl-1', 
          name: 'Targeted Letter', 
          kind: 'coverLetter',
          template: 'modern',
          updatedAt: Date.now()
        },
        {
          id: 'res-1',
          name: 'Master Resume',
          kind: 'resume',
          template: 'crisp',
          updatedAt: Date.now()
        }
      ]),
      readJobs: () => Promise.resolve({
        version: 1,
        jobs: [
          { id: 'job-1', company: 'Globex', role: 'Software Engineer', status: 'wishlist' }
        ]
      })
    };
  });
});

test('Cover Letter Dashboard Redesign', async ({ page }) => {
  await page.goto('/builder/cover-letter');
  
  // Check dashboard header (it was changed back to "My Cover Letters" in the mirror step)
  await expect(page.getByRole('heading', { name: /My Cover Letters/i })).toBeVisible();
  
  // Check the card
  await expect(page.getByText('Targeted Letter')).toBeVisible();
});

test('Cover Letter Workshop Navigation & Sync', async ({ page }) => {
  // Go to the specific cover letter
  await page.goto('/builder/new?id=cl-1');
  
  // Workshop should load the Body section by default
  await expect(page.getByText('Letter Composition')).toBeVisible();
  
  // Switch to Target section (using the sidebar icon button)
  // Since they are icons in tooltips, we might need to target by role and nth or better, add testids
  // For now let's try getByRole('button').nth(x) or by title if tooltips render them
  await page.getByRole('button', { name: 'Target Job' }).click();
  await expect(page.getByText('Application Context')).toBeVisible();
  
  // Switch to Letterhead section
  await page.getByRole('button', { name: 'Letterhead' }).click();
  await expect(page.getByText('Profile Connection')).toBeVisible();
});

test('AI Assistant key reminder', async ({ page }) => {
  await page.goto('/builder/new?id=cl-1');
  
  // AI button should be disabled
  const aiButton = page.getByRole('button', { name: /AI Assistant/i }).first();
  await expect(aiButton).toBeDisabled();
});
