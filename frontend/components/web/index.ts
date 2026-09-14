import type { TemplateId, ResumeSettings } from '@/lib/store/types'
import type { ComponentType } from 'react'
import type { Resume } from '@/lib/store/types'
import { MasterTemplate } from './MasterTemplate'

// Registry — add new templates here only
export const TEMPLATE_META: Record<TemplateId, { label: string; description: string }> = {
  modern:  { label: 'Modern',  description: 'Two columns with a slim right sidebar, clean sans type and a photo beside the name' },
  classic: { label: 'Classic', description: 'Traditional centred serif page in black ink with hairline rules' },
  minimal: { label: 'Minimal', description: 'Light name, no heading rules and dates in a left gutter — content only' },
  crisp:   { label: 'Crisp',   description: 'Name on the left, contact details stacked on the right, green accent bars' },
  tokyo:   { label: 'Tokyo',   description: 'Bold red header band with a centred portrait, icon headings and skill pills' },
  elite:   { label: 'Elite',   description: 'Framed executive page, right-aligned serif header and square portrait' },
  blocks:  { label: 'Blocks',  description: 'Solid blue sidebar with white skill pills beside a clean main column' },
  dublin:  { label: 'Dublin',  description: 'Deep navy sidebar with the name, a large portrait and icon contacts; centred box headings' },
  london:  { label: 'London',  description: 'Editorial serif on warm paper with a centred portrait and double rules' },
  berlin:  { label: 'Berlin',  description: 'Black sidebar with yellow highlights — a bold, Bauhaus-inspired layout' },
  oslo:    { label: 'Oslo',    description: 'Warm tinted sidebar with rounded skill pills and a friendly sans' },
  zurich:  { label: 'Zurich',  description: 'Precise report: boxed headings, a contact grid and rated skills' },
  milano:  { label: 'Milano',  description: 'Warm serif with the title in italics beside the name, icon headings and a left summary column' },
  seoul:   { label: 'Seoul',   description: 'Compact lavender sidebar on the left with a multi-column skills grid' },
  aspen:   { label: 'Aspen',   description: 'Soft green sidebar with a large round photo, name and details' },
  vega:    { label: 'Vega',    description: 'Dense single column that fits a long history on one page' },
  lumen:   { label: 'Lumen',   description: 'Spacious centred layout with a large portrait for a first-job resume' },
  atlas:   { label: 'Atlas',   description: 'Full-bleed navy header band with the photo over a two-column body' },
  sierra:  { label: 'Sierra',  description: 'Creative left sidebar in warm orange, knockout icons and a big name' },
  nova:    { label: 'Nova',    description: 'Executive serif with the portrait and name centred as one group' },
  custom:  { label: 'Custom',  description: 'Your unique vision — fully adjustable settings for a bespoke experience' },
}

export { MasterTemplate, TemplateFooter } from './MasterTemplate'
export interface TemplateProps {
  resume: Resume
  pads?: number[]
  hideFooter?: boolean
  isMeasurement?: boolean
}

// All templates now use the MasterTemplate, but with different initial settings
export async function getTemplateComponent(
  _id: TemplateId
): Promise<ComponentType<TemplateProps>> {
  return MasterTemplate
}

/**
 * The full set of layout settings every preset starts from. Each preset
 * overrides only what makes it different; everything else is reset here so
 * switching templates never keeps a choice the previous template made (a
 * solid sidebar, details beside the name, a square photo...). Photo on/off and
 * the user's own content settings (paper size, date format, language) are
 * deliberately left alone.
 */
function base(accent: string): Partial<ResumeSettings> {
  return {
    accentColor:                  accent,
    colorMode:                    'basic',
    headingColor:                 accent,
    textColor:                    '#1a1a1a',
    subtitleColor:                '#4a5568',
    dateColor:                    '#4a5568',
    backgroundColor:              '#ffffff',
    themeColorStyle:              'basic',

    columnLayout:                 'one',
    columnReverse:                false,
    columnWidthMode:              'auto',
    columnWidth:                  30,
    headerLayout:                 'top',
    sidebarTheme:                 'none',
    sidebarFill:                  'tint',
    sidebarBackgroundColor:       undefined,

    applyAccentName:              true,
    applyAccentJobTitle:          false,
    applyAccentHeadings:          true,
    applyAccentHeadingLine:       true,
    applyAccentHeaderIcons:       false,
    applyAccentDotsBarsBubbles:   false,
    applyAccentDates:             false,
    applyAccentEntrySubtitle:     false,
    applyAccentLinkIcons:         false,

    headerAlignment:              'left',
    headerArrangement:            'verticalBar',
    nameSize:                     'L',
    nameBold:                     true,
    detailsArrangement:           'wrap',
    detailsPosition:              'below',
    detailsTextAlignment:         'left',
    contactIcons:                 false,
    contactIconStyle:             'none',

    photoSize:                    'M',
    photoShape:                   'circle',
    photoPosition:                'beside',
    photoAlignment:               'left',
    photoVerticalAlign:           'center',
    photoBorderStyle:             'none',
    photoBorderColor:             '#e5e7eb',
    photoGap:                     14,

    sectionHeadingStyle:          'underline',
    sectionHeadingSize:           'M',
    sectionHeadingCapitalization: 'uppercase',
    sectionHeadingIcon:           'none',
    sectionHeadingIconSize:       1.0,
    sectionHeadingLineThickness:  1.5,
    sectionHeadingAlign:          'left',
    jobTitleStyle:                'caps',
    jobTitlePlacement:            'below',
    sidebarSectionTypes:          undefined,
    columnDivider:                true,
    experienceOrder:              'title-employer',

    entryLayout:                  'date-location-right',
    subtitlePlacement:            'next-line',
    subtitleStyle:                'normal',
    titleSize:                    'M',
    indentBody:                   false,
    skillDisplay:                 'compact',
    skillColumns:                 3,

    fontSize:                     10,
    lineHeight:                   1.45,
    marginHorizontal:             18,
    marginVertical:               14,
    entrySpacing:                 1,
    sectionSpacing:               1,
  }
}

/**
 * Returns the setting overrides for a specific template preset.
 * When a user clicks a template, we apply these settings to their resume.
 *
 * Presets are grouped by page architecture so no two read alike:
 *   plain columns   modern, crisp, seoul, sierra, oslo
 *   solid sidebar   blocks, dublin, berlin
 *   header sidebar  aspen, dublin, berlin
 *   header band     tokyo, atlas
 *   single column   classic, minimal, elite, london, zurich, milano, vega, lumen, nova
 * and each carries its own photo treatment (size, shape, placement, border).
 */
export function getTemplateSettings(id: TemplateId): Partial<ResumeSettings> {
  switch (id) {
    // Plain two columns, right sidebar, photo beside the name.
    case 'modern':
      return {
        ...base('#1e3a5f'),
        applyAccentJobTitle:          true,
        applyAccentLinkIcons:         true,
        columnLayout:                 'two',
        photoSize:                    'L',
        fontFamily:                   'Inter',
        fontSize:                     10.5,
        sectionHeadingLineThickness:  1,
        skillDisplay:                 'compact',
      }

    // Traditional: centred black serif, hairline rules, small portrait on top.
    case 'classic':
      return {
        ...base('#111111'),
        applyAccentName:              false,
        headerAlignment:              'center',
        detailsTextAlignment:         'center',
        headerArrangement:            'bullet',
        nameSize:                     'XL',
        photoPosition:                'top',
        photoBorderStyle:             'thin',
        sectionHeadingSize:           'S',
        sectionHeadingLineThickness:  0.75,
        subtitleStyle:                'italic',
        fontFamily:                   'Merriweather',
        lineHeight:                   1.5,
        marginHorizontal:             20,
      }

    // Content only: light name, no rules, dates in a left gutter.
    case 'minimal':
      return {
        ...base('#404040'),
        applyAccentName:              false,
        applyAccentHeadings:          false,
        applyAccentHeadingLine:       false,
        headerArrangement:            'none',
        detailsArrangement:           'wrap',
        nameSize:                     'XL',
        nameBold:                     false,
        photoShape:                   'square',
        photoVerticalAlign:           'top',
        sectionHeadingStyle:          'none',
        sectionHeadingCapitalization: 'none',
        sectionHeadingSize:           'L',
        entryLayout:                  'full-width',
        fontFamily:                   'Inter',
        fontSize:                     10.5,
        lineHeight:                   1.6,
        marginHorizontal:             24,
        marginVertical:               20,
        entrySpacing:                 1.1,
        sectionSpacing:               1.3,
      }

    // Name left, details stacked right, green bars, contact icons.
    case 'crisp':
      return {
        ...base('#047857'),
        applyAccentHeaderIcons:       true,
        applyAccentLinkIcons:         true,
        columnLayout:                 'mix',
        detailsPosition:              'beside',
        detailsArrangement:           'column',
        detailsTextAlignment:         'right',
        contactIcons:                 true,
        contactIconStyle:             'none',
        photoShape:                   'rounded',
        sectionHeadingStyle:          'left-bar',
        sectionHeadingSize:           'S',
        skillDisplay:                 'grid',
        skillColumns:                 2,
        fontFamily:                   'Lato',
        fontSize:                     10.5,
        entrySpacing:                 0.95,
      }

    // Red header band, centred portrait on top, icon headings, pills.
    case 'tokyo':
      return {
        ...base('#b91c1c'),
        themeColorStyle:              'advanced',
        applyAccentDotsBarsBubbles:   true,
        applyAccentDates:             true,
        applyAccentLinkIcons:         true,
        headerAlignment:              'center',
        detailsTextAlignment:         'center',
        headerArrangement:            'bullet',
        nameSize:                     'XXL',
        photoPosition:                'top',
        photoSize:                    'L',
        photoBorderStyle:             'thick',
        photoBorderColor:             '#ffffff',
        sectionHeadingStyle:          'background',
        sectionHeadingIcon:           'filled',
        skillDisplay:                 'bubble',
        entryLayout:                  'date-content-location',
        subtitlePlacement:            'same-line',
        fontFamily:                   'Roboto',
        marginHorizontal:             16,
        marginVertical:               12,
        entrySpacing:                 0.95,
      }

    // Framed executive page, right-aligned header, square portrait on the right.
    case 'elite':
      return {
        ...base('#18181b'),
        themeColorStyle:              'border',
        applyAccentName:              false,
        applyAccentHeadings:          false,
        applyAccentDotsBarsBubbles:   true,
        headerAlignment:              'right',
        detailsTextAlignment:         'right',
        nameSize:                     'XL',
        photoSize:                    'L',
        photoShape:                   'square',
        photoAlignment:               'right',
        photoBorderStyle:             'thin',
        sectionHeadingStyle:          'top-bottom',
        sectionHeadingLineThickness:  1,
        skillDisplay:                 'level',
        subtitleStyle:                'italic',
        fontFamily:                   'Playfair Display',
        lineHeight:                   1.5,
        marginHorizontal:             22,
        marginVertical:               18,
        entrySpacing:                 1.1,
      }

    // Solid blue sidebar on the right with white pills.
    case 'blocks':
      return {
        ...base('#1d4ed8'),
        applyAccentJobTitle:          true,
        applyAccentDotsBarsBubbles:   true,
        applyAccentLinkIcons:         true,
        columnLayout:                 'two',
        columnWidthMode:              'manual',
        columnWidth:                  33,
        sidebarTheme:                 'accent',
        sidebarFill:                  'solid',
        nameSize:                     'XL',
        photoSize:                    'L',
        photoShape:                   'rounded',
        sectionHeadingStyle:          'background',
        sectionHeadingSize:           'S',
        skillDisplay:                 'bubble',
        fontFamily:                   'Inter',
        fontSize:                     10.5,
        lineHeight:                   1.5,
        entrySpacing:                 1.05,
      }

    // Deep navy sidebar on the left: name, as-typed job title, a large
    // portrait below them and icon contacts. Headings are centred boxes with
    // icons — light on the panel, grey in the main column.
    case 'dublin':
      return {
        ...base('#1e3044'),
        applyAccentName:              false,
        applyAccentHeadings:          false,
        applyAccentHeadingLine:       false,
        columnLayout:                 'two',
        columnReverse:                true,
        columnWidthMode:              'manual',
        columnWidth:                  40,
        headerLayout:                 'sidebar',
        sidebarTheme:                 'custom',
        sidebarBackgroundColor:       '#1e3044',
        sidebarFill:                  'solid',
        headerAlignment:              'left',
        detailsTextAlignment:         'left',
        headerArrangement:            'none',
        detailsArrangement:           'column',
        contactIcons:                 true,
        nameSize:                     'XL',
        jobTitleStyle:                'normal',
        photoEnabled:                 true,
        photoSize:                    'XL',
        photoPosition:                'bottom',
        sectionHeadingStyle:          'background',
        sectionHeadingAlign:          'center',
        sectionHeadingIcon:           'filled',
        sectionHeadingIconSize:       1.6,
        sectionHeadingSize:           'M',
        entryLayout:                  'full-width',
        experienceOrder:              'employer-title',
        skillDisplay:                 'dots',
        fontFamily:                   'Merriweather',
        fontSize:                     10,
        lineHeight:                   1.5,
        marginHorizontal:             16,
        marginVertical:               16,
        entrySpacing:                 1.15,
      }

    // Editorial serif on warm paper, centred portrait, double rules.
    case 'london':
      return {
        ...base('#7c2d12'),
        backgroundColor:              '#fbf7f0',
        applyAccentName:              false,
        applyAccentHeadings:          false,
        applyAccentEntrySubtitle:     true,
        headerAlignment:              'center',
        detailsTextAlignment:         'center',
        headerArrangement:            'bullet',
        nameSize:                     'XXL',
        photoPosition:                'top',
        photoSize:                    'L',
        photoBorderStyle:             'medium',
        photoBorderColor:             '#7c2d12',
        sectionHeadingStyle:          'top-bottom',
        sectionHeadingLineThickness:  0.5,
        subtitleStyle:                'italic',
        fontFamily:                   'Playfair Display',
        fontSize:                     10.5,
        lineHeight:                   1.5,
        marginHorizontal:             24,
        marginVertical:               20,
        entrySpacing:                 1.15,
      }

    // Black sidebar on the right, yellow highlights, square portrait.
    case 'berlin':
      return {
        ...base('#facc15'),
        applyAccentHeadings:          false,
        applyAccentHeaderIcons:       true,
        applyAccentDotsBarsBubbles:   true,
        columnLayout:                 'two',
        columnWidthMode:              'manual',
        columnWidth:                  35,
        headerLayout:                 'sidebar',
        sidebarTheme:                 'custom',
        sidebarBackgroundColor:       '#111111',
        sidebarFill:                  'solid',
        headerArrangement:            'none',
        detailsArrangement:           'column',
        contactIcons:                 true,
        photoEnabled:                 true,
        photoSize:                    'XL',
        photoShape:                   'square',
        nameSize:                     'XL',
        sectionHeadingStyle:          'left-bar',
        sectionHeadingSize:           'L',
        skillDisplay:                 'dots',
        entryLayout:                  'full-width',
        fontFamily:                   'Roboto',
        marginHorizontal:             16,
      }

    // Warm tinted sidebar, pills, friendly sans.
    case 'oslo':
      return {
        ...base('#b45309'),
        applyAccentHeaderIcons:       true,
        applyAccentDotsBarsBubbles:   true,
        applyAccentLinkIcons:         true,
        applyAccentHeadingLine:       false,
        columnLayout:                 'two',
        columnWidthMode:              'manual',
        columnWidth:                  34,
        sidebarTheme:                 'accent',
        headerArrangement:            'bullet',
        photoSize:                    'L',
        photoBorderStyle:             'medium',
        photoBorderColor:             '#fde68a',
        sectionHeadingStyle:          'none',
        skillDisplay:                 'bubble',
        fontFamily:                   'Raleway',
        fontSize:                     10.5,
        lineHeight:                   1.5,
        entrySpacing:                 1.05,
      }

    // Precise report: boxed headings, contact grid, rated skills.
    case 'zurich':
      return {
        ...base('#334155'),
        applyAccentName:              false,
        headerArrangement:            'none',
        detailsArrangement:           'grid',
        photoShape:                   'square',
        photoBorderStyle:             'thin',
        sectionHeadingStyle:          'box',
        sectionHeadingSize:           'S',
        sectionHeadingLineThickness:  0.75,
        skillDisplay:                 'level',
        fontFamily:                   'IBM Plex Serif',
        marginHorizontal:             20,
        marginVertical:               16,
      }

    // Photo beside the name with the job title in italics on the same line,
    // accent contact icons, a left column for summary and skills, and icon
    // headings over an accent rule. No column divider.
    case 'milano':
      return {
        ...base('#f29111'),
        applyAccentName:              false,
        applyAccentHeadings:          false,
        applyAccentHeaderIcons:       true,
        applyAccentLinkIcons:         true,
        columnLayout:                 'two',
        columnReverse:                true,
        columnWidthMode:              'manual',
        columnWidth:                  34,
        columnDivider:                false,
        sidebarSectionTypes:          ['summary', 'skills', 'languages', 'certifications', 'awards', 'references'],
        headerArrangement:            'none',
        detailsArrangement:           'wrap',
        contactIcons:                 true,
        nameSize:                     'XL',
        jobTitleStyle:                'italic',
        jobTitlePlacement:            'inline',
        photoSize:                    'XL',
        photoGap:                     20,
        sectionHeadingStyle:          'underline',
        sectionHeadingIcon:           'filled',
        sectionHeadingIconSize:       1.6,
        sectionHeadingSize:           'L',
        sectionHeadingLineThickness:  1.5,
        entryLayout:                  'full-width',
        subtitlePlacement:            'same-line',
        subtitleStyle:                'italic',
        skillDisplay:                 'compact',
        fontFamily:                   'Merriweather',
        fontSize:                     10,
        lineHeight:                   1.5,
        marginHorizontal:             18,
        marginVertical:               16,
        entrySpacing:                 1.05,
      }

    // Compact lavender sidebar on the left, skills grid.
    case 'seoul':
      return {
        ...base('#4338ca'),
        applyAccentHeaderIcons:       true,
        applyAccentEntrySubtitle:     true,
        applyAccentLinkIcons:         true,
        columnLayout:                 'two',
        columnReverse:                true,
        columnWidthMode:              'manual',
        columnWidth:                  30,
        sidebarTheme:                 'custom',
        sidebarBackgroundColor:       '#eef2ff',
        sidebarFill:                  'solid',
        headerArrangement:            'none',
        detailsArrangement:           'column',
        detailsPosition:              'beside',
        detailsTextAlignment:         'right',
        photoSize:                    'S',
        photoShape:                   'rounded',
        sectionHeadingStyle:          'left-bar',
        sectionHeadingSize:           'S',
        skillDisplay:                 'grid',
        skillColumns:                 2,
        entryLayout:                  'date-content-location',
        subtitlePlacement:            'same-line',
        fontFamily:                   'Source Sans Pro',
        marginHorizontal:             16,
        marginVertical:               12,
        entrySpacing:                 0.95,
      }

    // Soft green sidebar holding a large round photo, name and details.
    case 'aspen':
      return {
        ...base('#3f6b54'),
        applyAccentHeaderIcons:       true,
        applyAccentDotsBarsBubbles:   true,
        applyAccentLinkIcons:         true,
        columnLayout:                 'two',
        columnReverse:                true,
        columnWidthMode:              'manual',
        columnWidth:                  33,
        sidebarTheme:                 'accent',
        headerLayout:                 'sidebar',
        headerAlignment:              'center',
        detailsTextAlignment:         'center',
        headerArrangement:            'none',
        detailsArrangement:           'column',
        photoEnabled:                 true,
        photoSize:                    'XL',
        photoPosition:                'top',
        contactIcons:                 true,
        sectionHeadingLineThickness:  0.75,
        skillDisplay:                 'bubble',
        fontFamily:                   'Lato',
        marginHorizontal:             16,
      }

    // Dense single column.
    case 'vega':
      return {
        ...base('#1f2937'),
        applyAccentName:              false,
        detailsArrangement:           'wrap',
        nameSize:                     'M',
        photoSize:                    'S',
        photoShape:                   'rounded',
        sectionHeadingSize:           'S',
        sectionHeadingLineThickness:  0.75,
        subtitlePlacement:            'same-line',
        subtitleStyle:                'italic',
        fontFamily:                   'Source Sans Pro',
        fontSize:                     9.5,
        lineHeight:                   1.3,
        marginHorizontal:             14,
        marginVertical:               10,
        entrySpacing:                 0.75,
        sectionSpacing:               0.85,
      }

    // Spacious centred page with a large portrait on top.
    case 'lumen':
      return {
        ...base('#0f766e'),
        applyAccentJobTitle:          true,
        applyAccentHeaderIcons:       true,
        applyAccentDotsBarsBubbles:   true,
        applyAccentEntrySubtitle:     true,
        applyAccentLinkIcons:         true,
        headerAlignment:              'center',
        detailsTextAlignment:         'center',
        headerArrangement:            'bullet',
        nameSize:                     'XL',
        photoEnabled:                 true,
        photoSize:                    'XL',
        photoPosition:                'top',
        photoBorderStyle:             'thick',
        photoBorderColor:             '#99f6e4',
        sectionHeadingStyle:          'overline',
        sectionHeadingLineThickness:  1,
        skillDisplay:                 'bubble',
        fontFamily:                   'Raleway',
        fontSize:                     11,
        lineHeight:                   1.6,
        marginHorizontal:             22,
        marginVertical:               18,
        entrySpacing:                 1.25,
        sectionSpacing:               1.2,
      }

    // Full-bleed navy band with the photo, two-column body.
    case 'atlas':
      return {
        ...base('#1e3a8a'),
        themeColorStyle:              'advanced',
        applyAccentName:              false,
        applyAccentHeaderIcons:       true,
        applyAccentDotsBarsBubbles:   true,
        applyAccentDates:             true,
        applyAccentLinkIcons:         true,
        columnLayout:                 'two',
        columnWidthMode:              'manual',
        columnWidth:                  31,
        headerArrangement:            'none',
        detailsArrangement:           'grid',
        nameSize:                     'XL',
        photoEnabled:                 true,
        photoSize:                    'L',
        photoBorderStyle:             'thick',
        photoBorderColor:             '#ffffff',
        sectionHeadingStyle:          'left-bar',
        sectionHeadingSize:           'S',
        skillDisplay:                 'dots',
        fontFamily:                   'Inter',
      }

    // Warm left sidebar, knockout icons, big name.
    case 'sierra':
      return {
        ...base('#c2410c'),
        applyAccentJobTitle:          true,
        applyAccentHeaderIcons:       true,
        applyAccentDotsBarsBubbles:   true,
        applyAccentDates:             true,
        applyAccentLinkIcons:         true,
        columnLayout:                 'mix',
        columnReverse:                true,
        columnWidthMode:              'manual',
        columnWidth:                  32,
        sidebarTheme:                 'accent',
        headerArrangement:            'bullet',
        nameSize:                     'XXL',
        photoSize:                    'L',
        photoShape:                   'rounded',
        sectionHeadingStyle:          'background',
        sectionHeadingSize:           'S',
        sectionHeadingIcon:           'knockout',
        sectionHeadingIconSize:       0.9,
        skillDisplay:                 'bubble',
        entryLayout:                  'date-content-location',
        subtitlePlacement:            'same-line',
        fontFamily:                   'Roboto',
        marginHorizontal:             16,
        marginVertical:               12,
        entrySpacing:                 0.95,
      }

    // Executive serif, portrait and name centred as one group.
    case 'nova':
      return {
        ...base('#0c4a6e'),
        applyAccentName:              false,
        applyAccentJobTitle:          true,
        applyAccentHeadingLine:       false,
        applyAccentDotsBarsBubbles:   true,
        applyAccentEntrySubtitle:     true,
        headerAlignment:              'center',
        detailsTextAlignment:         'center',
        nameSize:                     'XXL',
        photoBorderStyle:             'thin',
        sectionHeadingStyle:          'top-bottom',
        sectionHeadingLineThickness:  0.5,
        skillDisplay:                 'level',
        subtitleStyle:                'italic',
        fontFamily:                   'IBM Plex Serif',
        fontSize:                     10.5,
        lineHeight:                   1.5,
        marginHorizontal:             22,
        marginVertical:               16,
        entrySpacing:                 1.1,
      }

    default:
      return {}
  }
}
