import { Page } from '@playwright/test';

export async function mockElectronBridge(page: Page) {
  await page.addInitScript(() => {
    (window as any).electron = {
      platform: 'darwin',
      vault: {
        getPath: () => Promise.resolve('/mock/path'),
        list: () => Promise.resolve([]),
        read: (id: string) => Promise.resolve({
          id,
          name: 'Test Resume',
          template: 'modern',
          settings: {
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
          },
          sections: [
            { id: 'sec-1', type: 'header', title: 'Personal Details', visible: true, items: { fullName: 'John Doe' } },
            { id: 'sec-2', type: 'summary', title: 'Summary', visible: true, items: { text: 'Hello world' } }
          ]
        }),
        write: (resume: any) => {
          console.log('Mock Vault Write:', resume);
          return Promise.resolve();
        },
      },
      onUpdateAvailable: () => () => {},
      onUpdateDownloaded: () => () => {},
      getApiKey: () => Promise.resolve(''),
      setApiKey: () => Promise.resolve(),
    };
  });
}
