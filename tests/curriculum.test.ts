import { describe, it } from 'node:test'
import assert from 'node:assert'
import { CURRICULUM_REGISTRY } from '../lib/curriculum/registry.ts'
import { validateCurriculumImport } from '../lib/curriculum/validator.ts'

describe('Curriculum Registry and Syllabus Versions', () => {
  it('contains all 4 required examination tracks', () => {
    const tracks = Object.keys(CURRICULUM_REGISTRY)
    assert.ok(tracks.includes('gate_cse'))
    assert.ok(tracks.includes('ca_foundation'))
    assert.ok(tracks.includes('ca_intermediate'))
    assert.ok(tracks.includes('ca_final'))
  })

  it('verifies CA Foundation has 4 official papers with correct marking rules', () => {
    const fnd = CURRICULUM_REGISTRY.ca_foundation
    assert.strictEqual(fnd.papers.length, 4)

    const paper1 = fnd.papers.find(p => p.paperNumber === 1)!
    assert.strictEqual(paper1.title, 'Accounting')
    assert.strictEqual(paper1.hasNegativeMarking, false)

    const paper3 = fnd.papers.find(p => p.paperNumber === 3)!
    assert.strictEqual(paper3.title, 'Quantitative Aptitude')
    assert.strictEqual(paper3.hasNegativeMarking, true)
    assert.strictEqual(paper3.negativeMarkRate, 0.25)
  })

  it('verifies CA Intermediate has Group I and Group II (6 papers total)', () => {
    const inter = CURRICULUM_REGISTRY.ca_intermediate
    assert.strictEqual(inter.papers.length, 6)

    const group1 = inter.papers.filter(p => p.group === 'Group I')
    const group2 = inter.papers.filter(p => p.group === 'Group II')

    assert.strictEqual(group1.length, 3)
    assert.strictEqual(group2.length, 3)
  })

  it('verifies CA Final includes 6 papers and syllabus version metadata', () => {
    const finalTrack = CURRICULUM_REGISTRY.ca_final
    assert.strictEqual(finalTrack.papers.length, 6)
    assert.strictEqual(finalTrack.versions[0].isApproved, true)
    assert.ok(finalTrack.versions[0].officialSourceUrl.includes('icai.org'))
  })

  it('validates curriculum import payload correctly catches missing titles', () => {
    const invalidPayload = {
      papers: [
        {
          paperNumber: 1,
          // title is missing!
          chapters: [{ title: 'Chapter 1' }],
        },
      ],
    }

    const result = validateCurriculumImport(invalidPayload, 'ca_foundation')
    assert.strictEqual(result.isValid, false)
    assert.ok(result.errors.some(e => e.includes('Missing title')))
  })
})
