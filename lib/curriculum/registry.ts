/**
 * lib/curriculum/registry.ts
 *
 * Official Curriculum Registry for PrepAxis AI.
 * Backed by official ICAI New Scheme (2024/2025/2026) and GATE CSE syllabus documents.
 */

import type { ExamTrackCurriculum, ExamTrackType } from './types'

export const CURRICULUM_REGISTRY: Record<ExamTrackType, ExamTrackCurriculum> = {
  gate_cse: {
    track: 'gate_cse',
    trackName: 'GATE Computer Science & IT',
    badge: 'National Engineering Entrance',
    activeSyllabusVersion: 'GATE_CSE_2025_2026',
    versions: [
      {
        versionId: 'GATE_CSE_2025_2026',
        examTrack: 'gate_cse',
        title: 'GATE CSE Official Syllabus (2025/2026)',
        effectiveFrom: '2024-08-01',
        applicableSessions: ['February 2025', 'February 2026'],
        officialSourceUrl: 'https://gate2025.iitr.ac.in/syllabus.html',
        lastVerifiedDate: '2025-01-15',
        isApproved: true,
        description: 'Standard syllabus prescribed by the GATE Organizing Institute (IISc/IITs).',
      },
    ],
    papers: [
      {
        id: 'gate_cs_core',
        paperNumber: 1,
        title: 'Computer Science and Information Technology',
        code: 'CS',
        marks: 100,
        durationMinutes: 180,
        hasNegativeMarking: true,
        negativeMarkRate: 0.33,
        officialSourceUrl: 'https://gate2025.iitr.ac.in',
        chapters: [
          {
            id: 'gate_eng_math',
            chapterNumber: 1,
            title: 'Engineering Mathematics',
            weightageEstimated: '13-15 Marks',
            topics: [
              {
                id: 'discrete_math',
                title: 'Discrete Mathematics',
                orderNum: 1,
                subtopics: [
                  { id: 'prop_logic', title: 'Propositional and First Order Logic', orderNum: 1 },
                  { id: 'sets_relations', title: 'Sets, Relations, Functions, Partial Orders and Lattices', orderNum: 2 },
                  { id: 'graph_theory', title: 'Monoids, Groups, Graphs: connectivity, matching, coloring', orderNum: 3 },
                  { id: 'combinatorics', title: 'Combinatorics: counting, recurrence relations, generating functions', orderNum: 4 },
                ],
              },
              {
                id: 'linear_algebra',
                title: 'Linear Algebra',
                orderNum: 2,
                subtopics: [
                  { id: 'matrices', title: 'Matrices, determinants, systems of linear equations', orderNum: 1 },
                  { id: 'eigenvalues', title: 'Eigenvalues and Eigenvectors, LU decomposition', orderNum: 2 },
                ],
              },
              {
                id: 'calculus',
                title: 'Calculus',
                orderNum: 3,
                subtopics: [
                  { id: 'limits_derivatives', title: 'Limits, continuity and differentiability', orderNum: 1 },
                  { id: 'integrals', title: 'Maxima and minima, Mean value theorem, Integration', orderNum: 2 },
                ],
              },
              {
                id: 'probability',
                title: 'Probability and Statistics',
                orderNum: 4,
                subtopics: [
                  { id: 'random_vars', title: 'Random variables, Uniform, Normal, Exponential, Poisson, Binomial', orderNum: 1 },
                  { id: 'bayes_stats', title: 'Mean, median, mode, standard deviation, conditional probability and Bayes theorem', orderNum: 2 },
                ],
              },
            ],
          },
          {
            id: 'gate_digital_logic',
            chapterNumber: 2,
            title: 'Digital Logic',
            weightageEstimated: '4-6 Marks',
            topics: [
              {
                id: 'boolean_algebra',
                title: 'Boolean Algebra & Minimization',
                orderNum: 1,
                subtopics: [
                  { id: 'k_maps', title: 'Boolean algebra, minimization of functions using Boolean identities and K-maps', orderNum: 1 },
                  { id: 'logic_gates', title: 'Logic gates and their static CMOS implementations', orderNum: 2 },
                ],
              },
              {
                id: 'combinational_circuits',
                title: 'Combinational and Sequential Circuits',
                orderNum: 2,
                subtopics: [
                  { id: 'arithmetic_circuits', title: 'Arithmetic circuits, code converters, multiplexers, decoders', orderNum: 1 },
                  { id: 'latches_flipflops', title: 'Latches, flip-flops, counters, shift registers, finite state machines', orderNum: 2 },
                ],
              },
            ],
          },
          {
            id: 'gate_coa',
            chapterNumber: 3,
            title: 'Computer Organization and Architecture',
            weightageEstimated: '6-8 Marks',
            topics: [
              {
                id: 'machine_instr',
                title: 'Machine Instructions & Addressing',
                orderNum: 1,
                subtopics: [
                  { id: 'addressing_modes', title: 'Machine instructions and addressing modes', orderNum: 1 },
                  { id: 'alu_datapath', title: 'ALU, data-path and control unit, instruction pipelining and hazards', orderNum: 2 },
                ],
              },
              {
                id: 'memory_hierarchy',
                title: 'Memory Hierarchy & I/O',
                orderNum: 2,
                subtopics: [
                  { id: 'cache_memory', title: 'Memory hierarchy: cache, main memory and secondary storage', orderNum: 1 },
                  { id: 'io_interface', title: 'I/O interface (interrupt and DMA mode)', orderNum: 2 },
                ],
              },
            ],
          },
          {
            id: 'gate_dsa',
            chapterNumber: 4,
            title: 'Programming and Data Structures',
            weightageEstimated: '10-12 Marks',
            topics: [
              {
                id: 'c_programming',
                title: 'Programming in C',
                orderNum: 1,
                subtopics: [
                  { id: 'recursion_pointers', title: 'Recursion, arrays, stacks, queues, linked lists', orderNum: 1 },
                  { id: 'trees_graphs', title: 'Trees, binary search trees, binary heaps, graphs', orderNum: 2 },
                ],
              },
            ],
          },
          {
            id: 'gate_algorithms',
            chapterNumber: 5,
            title: 'Algorithms',
            weightageEstimated: '8-10 Marks',
            topics: [
              {
                id: 'complexity_sorting',
                title: 'Searching, Sorting & Graph Traversal',
                orderNum: 1,
                subtopics: [
                  { id: 'asymptotic_analysis', title: 'Asymptotic worst and average time and space complexity', orderNum: 1 },
                  { id: 'sorting_algos', title: 'Searching, sorting, hashing, minimum spanning trees, shortest paths', orderNum: 2 },
                  { id: 'dp_greedy', title: 'Greedy, divide-and-conquer, dynamic programming', orderNum: 3 },
                ],
              },
            ],
          },
          {
            id: 'gate_toc',
            chapterNumber: 6,
            title: 'Theory of Computation',
            weightageEstimated: '7-9 Marks',
            topics: [
              {
                id: 'automata_grammars',
                title: 'Regular & Context-Free Languages',
                orderNum: 1,
                subtopics: [
                  { id: 'dfa_nfa', title: 'Regular expressions and finite automata, context-free grammars and push-down automata', orderNum: 1 },
                  { id: 'turing_decidability', title: 'Regular and context-free languages, pumping lemma, Turing machines and undecidability', orderNum: 2 },
                ],
              },
            ],
          },
          {
            id: 'gate_compiler',
            chapterNumber: 7,
            title: 'Compiler Design',
            weightageEstimated: '4-6 Marks',
            topics: [
              {
                id: 'parsing_codegen',
                title: 'Phases of Compilation',
                orderNum: 1,
                subtopics: [
                  { id: 'lexical_syntax', title: 'Lexical analysis, parsing, syntax-directed translation', orderNum: 1 },
                  { id: 'runtime_opt', title: 'Runtime environments, intermediate code generation, local optimization', orderNum: 2 },
                ],
              },
            ],
          },
          {
            id: 'gate_os',
            chapterNumber: 8,
            title: 'Operating System',
            weightageEstimated: '8-10 Marks',
            topics: [
              {
                id: 'processes_threads',
                title: 'Process Management & Deadlocks',
                orderNum: 1,
                subtopics: [
                  { id: 'cpu_scheduling', title: 'Processes, threads, inter-process communication, concurrency, synchronization, deadlocks, CPU scheduling', orderNum: 1 },
                  { id: 'virtual_memory', title: 'Memory management and virtual memory, file systems', orderNum: 2 },
                ],
              },
            ],
          },
          {
            id: 'gate_dbms',
            chapterNumber: 9,
            title: 'Databases',
            weightageEstimated: '7-9 Marks',
            topics: [
              {
                id: 'relational_model',
                title: 'Relational Model, Normalization & Transactions',
                orderNum: 1,
                subtopics: [
                  { id: 'er_relational', title: 'ER-model, relational algebra, tuple calculus, SQL', orderNum: 1 },
                  { id: 'integrity_normal', title: 'Integrity constraints, normal forms, transactions and concurrency control', orderNum: 2 },
                  { id: 'file_indexing', title: 'File organization, indexing (e.g., B and B+ trees)', orderNum: 3 },
                ],
              },
            ],
          },
          {
            id: 'gate_networks',
            chapterNumber: 10,
            title: 'Computer Networks',
            weightageEstimated: '8-10 Marks',
            topics: [
              {
                id: 'network_layers',
                title: 'Layers & Protocols',
                orderNum: 1,
                subtopics: [
                  { id: 'iso_osi', title: 'Concept of layering: OSI and TCP/IP Protocol Stacks', orderNum: 1 },
                  { id: 'data_link_mac', title: 'Flow and error control techniques, switching, IPv4/IPv6, routers and routing algorithms', orderNum: 2 },
                  { id: 'tcp_udp_app', title: 'TCP/UDP and sockets, congestion control, Application layer protocols (DNS, SMTP, POP, FTP, HTTP)', orderNum: 3 },
                ],
              },
            ],
          },
          {
            id: 'gate_general_aptitude',
            chapterNumber: 11,
            title: 'General Aptitude',
            weightageEstimated: '15 Marks',
            topics: [
              {
                id: 'verbal_quant',
                title: 'Verbal, Quantitative & Spatial Reasoning',
                orderNum: 1,
                subtopics: [
                  { id: 'verbal_ability', title: 'English grammar, vocabulary, reading comprehension', orderNum: 1 },
                  { id: 'quant_aptitude', title: 'Data interpretation, numerical computation, analytical reasoning', orderNum: 2 },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  ca_foundation: {
    track: 'ca_foundation',
    trackName: 'CA Foundation',
    badge: 'ICAI New Scheme',
    activeSyllabusVersion: 'ICAI_FND_NEW_SCHEME',
    versions: [
      {
        versionId: 'ICAI_FND_NEW_SCHEME',
        examTrack: 'ca_foundation',
        title: 'ICAI Foundation New Scheme of Education and Training',
        effectiveFrom: '2023-07-01',
        applicableSessions: ['June 2024', 'September 2024', 'January 2025', 'May/June 2025', 'September 2025'],
        officialSourceUrl: 'https://www.icai.org/post/foundation-nset',
        lastVerifiedDate: '2025-01-10',
        isApproved: true,
        description: 'New Scheme curriculum published by the Institute of Chartered Accountants of India (ICAI).',
      },
    ],
    papers: [
      {
        id: 'ca_fnd_p1',
        paperNumber: 1,
        title: 'Accounting',
        code: 'FND-P1',
        marks: 100,
        durationMinutes: 180,
        isObjectiveOnly: false,
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/foundation-nset',
        chapters: [
          {
            id: 'fnd_p1_c1',
            chapterNumber: 1,
            title: 'Theoretical Framework',
            topics: [
              { id: 'c1_t1', title: 'Meaning and Scope of Accounting', orderNum: 1, subtopics: [{ id: 's1', title: 'Accounting principles, concepts and conventions', orderNum: 1 }] },
              { id: 'c1_t2', title: 'Capital and Revenue Expenditures', orderNum: 2, subtopics: [{ id: 's2', title: 'Contingent assets and liabilities', orderNum: 1 }] },
              { id: 'c1_t3', title: 'Accounting Policies and Measurement', orderNum: 3, subtopics: [{ id: 's3', title: 'Accounting as a measurement discipline', orderNum: 1 }] },
            ],
          },
          {
            id: 'fnd_p1_c2',
            chapterNumber: 2,
            title: 'Accounting Process',
            topics: [
              { id: 'c2_t1', title: 'Recording Accounting Transactions', orderNum: 1, subtopics: [{ id: 's4', title: 'Journal, Ledger, Cash Book, Trial Balance', orderNum: 1 }] },
              { id: 'c2_t2', title: 'Rectification of Errors', orderNum: 2, subtopics: [{ id: 's5', title: 'Suspense account and error types', orderNum: 1 }] },
            ],
          },
          {
            id: 'fnd_p1_c3',
            chapterNumber: 3,
            title: 'Bank Reconciliation Statement',
            topics: [{ id: 'c3_t1', title: 'BRS Preparation', orderNum: 1, subtopics: [{ id: 's6', title: 'Timing differences and amended cash book method', orderNum: 1 }] }],
          },
          {
            id: 'fnd_p1_c4',
            chapterNumber: 4,
            title: 'Inventories',
            topics: [{ id: 'c4_t1', title: 'Valuation of Inventory', orderNum: 1, subtopics: [{ id: 's7', title: 'FIFO, Weighted Average, and Net Realizable Value (AS-2)', orderNum: 1 }] }],
          },
          {
            id: 'fnd_p1_c5',
            chapterNumber: 5,
            title: 'Depreciation and Amortisation',
            topics: [{ id: 'c5_t1', title: 'Depreciation Methods and Concepts', orderNum: 1, subtopics: [{ id: 's8', title: 'Straight line, WDV, changes in method/estimate', orderNum: 1 }] }],
          },
          {
            id: 'fnd_p1_c6',
            chapterNumber: 6,
            title: 'Bills of Exchange and Promissory Notes',
            topics: [{ id: 'c6_t1', title: 'Bills of Exchange Accounting', orderNum: 1, subtopics: [{ id: 's9', title: 'Accommodation bills, renewal, dishonour, insolvency', orderNum: 1 }] }],
          },
          {
            id: 'fnd_p1_c7',
            chapterNumber: 7,
            title: 'Final Accounts of Sole Proprietors',
            topics: [{ id: 'c7_t1', title: 'Trading, P&L, and Balance Sheet Preparation', orderNum: 1, subtopics: [{ id: 's10', title: 'Adjustments in final accounts', orderNum: 1 }] }],
          },
          {
            id: 'fnd_p1_c8',
            chapterNumber: 8,
            title: 'Financial Statements of Not-for-Profit Organisations',
            topics: [{ id: 'c8_t1', title: 'NPO Accounting', orderNum: 1, subtopics: [{ id: 's11', title: 'Receipts & Payments, Income & Expenditure accounts', orderNum: 1 }] }],
          },
          {
            id: 'fnd_p1_c9',
            chapterNumber: 9,
            title: 'Accounts from Incomplete Records (Single Entry)',
            topics: [{ id: 'c9_t1', title: 'Single Entry System', orderNum: 1, subtopics: [{ id: 's12', title: 'Statement of affairs and conversion method', orderNum: 1 }] }],
          },
          {
            id: 'fnd_p1_c10',
            chapterNumber: 10,
            title: 'Partnership and LLP Accounts',
            topics: [{ id: 'c10_t1', title: 'Partnership Fundamentals, Goodwill, Admission, Retirement, Dissolution', orderNum: 1, subtopics: [{ id: 's13', title: 'P&L appropriation, capital adjustments', orderNum: 1 }] }],
          },
          {
            id: 'fnd_p1_c11',
            chapterNumber: 11,
            title: 'Company Accounts',
            topics: [{ id: 'c11_t1', title: 'Issue, Forfeiture, and Re-issue of Shares and Debentures', orderNum: 1, subtopics: [{ id: 's14', title: 'Redemption of preference shares and debentures basics', orderNum: 1 }] }],
          },
        ],
      },
      {
        id: 'ca_fnd_p2',
        paperNumber: 2,
        title: 'Business Laws',
        code: 'FND-P2',
        marks: 100,
        durationMinutes: 180,
        isObjectiveOnly: false,
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/foundation-nset',
        chapters: [
          { id: 'fnd_p2_c1', chapterNumber: 1, title: 'Indian Regulatory Framework', topics: [{ id: 'p2_c1_t1', title: 'Overview of Indian Legal System & Courts', orderNum: 1, subtopics: [{ id: 's20', title: 'Sources of law and legislative process', orderNum: 1 }] }] },
          { id: 'fnd_p2_c2', chapterNumber: 2, title: 'The Indian Contract Act, 1872', topics: [{ id: 'p2_c2_t1', title: 'Nature, Offer & Acceptance, Consideration, Capacity, Free Consent, Performance, Breach', orderNum: 1, subtopics: [{ id: 's21', title: 'Quasi-contracts and remedies for breach', orderNum: 1 }] }] },
          { id: 'fnd_p2_c3', chapterNumber: 3, title: 'The Sale of Goods Act, 1930', topics: [{ id: 'p2_c3_t1', title: 'Formation, Conditions & Warranties, Transfer of Ownership, Unpaid Seller Rights', orderNum: 1, subtopics: [{ id: 's22', title: 'Doctrine of Caveat Emptor', orderNum: 1 }] }] },
          { id: 'fnd_p2_c4', chapterNumber: 4, title: 'The Indian Partnership Act, 1932', topics: [{ id: 'p2_c4_t1', title: 'General Nature, Relations of Partners, Registration and Dissolution', orderNum: 1, subtopics: [{ id: 's23', title: 'Implied authority and consequences of non-registration', orderNum: 1 }] }] },
          { id: 'fnd_p2_c5', chapterNumber: 5, title: 'The Limited Liability Partnership Act, 2008', topics: [{ id: 'p2_c5_t1', title: 'Meaning, Nature, Incorporation, Partners and Liabilities', orderNum: 1, subtopics: [{ id: 's24', title: 'Differences between Partnership, LLP and Company', orderNum: 1 }] }] },
          { id: 'fnd_p2_c6', chapterNumber: 6, title: 'The Companies Act, 2013', topics: [{ id: 'p2_c6_t1', title: 'Essential Features, Corporate Veil, Types of Companies, MOA & AOA, Share Capital', orderNum: 1, subtopics: [{ id: 's25', title: 'Doctrine of Indoor Management and Ultra Vires', orderNum: 1 }] }] },
          { id: 'fnd_p2_c7', chapterNumber: 7, title: 'The Negotiable Instruments Act, 1881', topics: [{ id: 'p2_c7_t1', title: 'Promissory Notes, Bills of Exchange, Cheques, Crossing, Dishonour Section 138', orderNum: 1, subtopics: [{ id: 's26', title: 'Holder and Holder in Due Course', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_fnd_p3',
        paperNumber: 3,
        title: 'Quantitative Aptitude',
        code: 'FND-P3',
        marks: 100,
        durationMinutes: 120,
        isObjectiveOnly: true,
        hasNegativeMarking: true,
        negativeMarkRate: 0.25,
        officialSourceUrl: 'https://www.icai.org/post/foundation-nset',
        chapters: [
          { id: 'fnd_p3_partA', chapterNumber: 1, title: 'Part A: Business Mathematics (40 Marks)', topics: [{ id: 'bm_t1', title: 'Ratio, Proportion, Indices, Logarithms, Equations, Linear Inequalities, Time Value of Money (Simple/Compound Interest, Annuity), Permutations & Combinations, Sequences & Series, Calculus', orderNum: 1, subtopics: [{ id: 's30', title: 'Effective rate of interest and Present Value of Annuity', orderNum: 1 }] }] },
          { id: 'fnd_p3_partB', chapterNumber: 2, title: 'Part B: Logical Reasoning (20 Marks)', topics: [{ id: 'lr_t1', title: 'Number Series, Coding-Decoding, Odd Man Out, Direction Tests, Seating Arrangements, Blood Relations', orderNum: 1, subtopics: [{ id: 's31', title: 'Linear and Circular Seating Arrangements', orderNum: 1 }] }] },
          { id: 'fnd_p3_partC', chapterNumber: 3, title: 'Part C: Statistics (40 Marks)', topics: [{ id: 'stat_t1', title: 'Statistical Representation of Data, Measures of Central Tendency & Dispersion, Probability, Theoretical Distributions, Correlation & Regression, Index Numbers', orderNum: 1, subtopics: [{ id: 's32', title: 'Normal distribution, rank correlation, Laspeyres & Paasche index', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_fnd_p4',
        paperNumber: 4,
        title: 'Business Economics',
        code: 'FND-P4',
        marks: 100,
        durationMinutes: 120,
        isObjectiveOnly: true,
        hasNegativeMarking: true,
        negativeMarkRate: 0.25,
        officialSourceUrl: 'https://www.icai.org/post/foundation-nset',
        chapters: [
          { id: 'fnd_p4_c1', chapterNumber: 1, title: 'Introduction to Business Economics', topics: [{ id: 'ec_t1', title: 'Nature, Scope, and Micro vs Macro Economics', orderNum: 1, subtopics: [{ id: 's40', title: 'Central problems of an economy', orderNum: 1 }] }] },
          { id: 'fnd_p4_c2', chapterNumber: 2, title: 'Theory of Demand and Supply', topics: [{ id: 'ec_t2', title: 'Law of Demand, Elasticity of Demand & Supply, Demand Forecasting', orderNum: 1, subtopics: [{ id: 's41', title: 'Consumer equilibrium and Indifference curve analysis', orderNum: 1 }] }] },
          { id: 'fnd_p4_c3', chapterNumber: 3, title: 'Theory of Production and Cost', topics: [{ id: 'ec_t3', title: 'Laws of Production, Returns to Scale, Short-run and Long-run Costs', orderNum: 1, subtopics: [{ id: 's42', title: 'Isoquants and Isocost curves', orderNum: 1 }] }] },
          { id: 'fnd_p4_c4', chapterNumber: 4, title: 'Price Determination in Different Markets', topics: [{ id: 'ec_t4', title: 'Perfect Competition, Monopoly, Monopolistic Competition, Oligopoly', orderNum: 1, subtopics: [{ id: 's43', title: 'Kinked demand curve and price discrimination', orderNum: 1 }] }] },
          { id: 'fnd_p4_c5', chapterNumber: 5, title: 'Determination of National Income', topics: [{ id: 'ec_t5', title: 'Macroeconomic aggregates, Keynesian Theory of Income Determination', orderNum: 1, subtopics: [{ id: 's44', title: 'Investment multiplier and circular flow', orderNum: 1 }] }] },
          { id: 'fnd_p4_c6', chapterNumber: 6, title: 'Business Cycles', topics: [{ id: 'ec_t6', title: 'Phases of Business Cycles, Causes and Economic Indicators', orderNum: 1, subtopics: [{ id: 's45', title: 'Leading, lagging, and coincident indicators', orderNum: 1 }] }] },
          { id: 'fnd_p4_c7', chapterNumber: 7, title: 'Public Finance', topics: [{ id: 'ec_t7', title: 'Fiscal Functions, Market Failure, Government Intervention, Fiscal Policy', orderNum: 1, subtopics: [{ id: 's46', title: 'Public goods and externalities', orderNum: 1 }] }] },
          { id: 'fnd_p4_c8', chapterNumber: 8, title: 'Money Market', topics: [{ id: 'ec_t8', title: 'Demand for Money, Supply of Money, Monetary Policy & RBI Functions', orderNum: 1, subtopics: [{ id: 's47', title: 'Repo rate, reverse repo, CRR, SLR mechanisms', orderNum: 1 }] }] },
          { id: 'fnd_p4_c9', chapterNumber: 9, title: 'International Trade', topics: [{ id: 'ec_t9', title: 'Theories of International Trade, Trade Policy Instruments, Exchange Rates', orderNum: 1, subtopics: [{ id: 's48', title: 'Tariffs, quotas, FDI and FII concepts', orderNum: 1 }] }] },
          { id: 'fnd_p4_c10', chapterNumber: 10, title: 'Indian Economy', topics: [{ id: 'ec_t10', title: 'Basic features, Economic Reforms since 1991, NITI Aayog', orderNum: 1, subtopics: [{ id: 's49', title: 'Recent developmental initiatives', orderNum: 1 }] }] },
        ],
      },
    ],
  },

  ca_intermediate: {
    track: 'ca_intermediate',
    trackName: 'CA Intermediate',
    badge: 'ICAI New Scheme',
    activeSyllabusVersion: 'ICAI_INT_NEW_SCHEME',
    versions: [
      {
        versionId: 'ICAI_INT_NEW_SCHEME',
        examTrack: 'ca_intermediate',
        title: 'ICAI Intermediate New Scheme (6 Papers)',
        effectiveFrom: '2023-07-01',
        applicableSessions: ['May 2024', 'September 2024', 'January 2025', 'May 2025', 'September 2025'],
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-intermediate',
        lastVerifiedDate: '2025-01-10',
        isApproved: true,
        description: 'New Scheme of Education and Training for CA Intermediate consisting of Group I and Group II (30% Case-based MCQs, 70% Descriptive).',
      },
    ],
    papers: [
      // GROUP I
      {
        id: 'ca_int_p1',
        paperNumber: 1,
        title: 'Advanced Accounting',
        code: 'INT-P1',
        marks: 100,
        durationMinutes: 180,
        group: 'Group I',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-intermediate',
        chapters: [
          { id: 'int_p1_c1', chapterNumber: 1, title: 'Applicability of Accounting Standards (AS 1 to 29)', topics: [{ id: 'p1_c1_t1', title: 'Detailed Study of All Mandated Accounting Standards', orderNum: 1, subtopics: [{ id: 's100', title: 'Revenue recognition (AS-9), Leases (AS-19), Segment reporting (AS-17)', orderNum: 1 }] }] },
          { id: 'int_p1_c2', chapterNumber: 2, title: 'Financial Statements of Companies', topics: [{ id: 'p1_c2_t1', title: 'Schedule III Division I Preparation, Cash Flow Statement (AS-3)', orderNum: 1, subtopics: [{ id: 's101', title: 'Managerial remuneration and divisible profits', orderNum: 1 }] }] },
          { id: 'int_p1_c3', chapterNumber: 3, title: 'Buyback of Securities and Equity Shares with Differential Rights', topics: [{ id: 'p1_c3_t1', title: 'Section 68, 69, 70 Compliance and Accounting Entries', orderNum: 1, subtopics: [{ id: 's102', title: 'Capital Redemption Reserve creation', orderNum: 1 }] }] },
          { id: 'int_p1_c4', chapterNumber: 4, title: 'Amalgamation of Companies (AS-14)', topics: [{ id: 'p1_c4_t1', title: 'Pooling of Interests vs Purchase Method, Purchase Consideration Calculation', orderNum: 1, subtopics: [{ id: 's103', title: 'Inter-company holdings and unrealized profits', orderNum: 1 }] }] },
          { id: 'int_p1_c5', chapterNumber: 5, title: 'Internal Reconstruction of Companies', topics: [{ id: 'p1_c5_t1', title: 'Capital Reduction Scheme and Journal Entries', orderNum: 1, subtopics: [{ id: 's104', title: 'Surrender of shares and settlement of liabilities', orderNum: 1 }] }] },
          { id: 'int_p1_c6', chapterNumber: 6, title: 'Accounting for Branches including Foreign Branches (AS-11)', topics: [{ id: 'p1_c6_t1', title: 'Dependent Branches, Independent Branches, and Currency Translation', orderNum: 1, subtopics: [{ id: 's105', title: 'Integral vs Non-integral foreign operations', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_int_p2',
        paperNumber: 2,
        title: 'Corporate and Other Laws',
        code: 'INT-P2',
        marks: 100,
        durationMinutes: 180,
        group: 'Group I',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-intermediate',
        chapters: [
          { id: 'int_p2_part1', chapterNumber: 1, title: 'Part I: Company Law (70 Marks)', topics: [{ id: 'p2_c1_t1', title: 'The Companies Act 2013 (Chapters I to XI): Incorporation, Prospectus, Share Capital, Debentures, Deposits, Charges, Management & Administration, Dividends, Accounts, Audit', orderNum: 1, subtopics: [{ id: 's110', title: 'Section 135 CSR, Section 123 Dividend declaration rules', orderNum: 1 }] }] },
          { id: 'int_p2_part2', chapterNumber: 2, title: 'The Limited Liability Partnership Act, 2008', topics: [{ id: 'p2_c2_t1', title: 'Detailed provisions, designated partners, financial disclosures', orderNum: 1, subtopics: [{ id: 's111', title: 'Conversion of firms/companies into LLP', orderNum: 1 }] }] },
          { id: 'int_p2_part3', chapterNumber: 3, title: 'Part II: Other Laws (30 Marks)', topics: [{ id: 'p2_c3_t1', title: 'General Clauses Act 1897, Interpretation of Statutes, The Foreign Exchange Management Act (FEMA) 1999', orderNum: 1, subtopics: [{ id: 's112', title: 'Current account vs Capital account transactions under FEMA', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_int_p3',
        paperNumber: 3,
        title: 'Taxation',
        code: 'INT-P3',
        marks: 100,
        durationMinutes: 180,
        group: 'Group I',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-intermediate',
        chapters: [
          { id: 'int_p3_secA', chapterNumber: 1, title: 'Section A: Income-tax Law (50 Marks)', topics: [{ id: 'p3_sA_t1', title: 'Basic Concepts, Residential Status, 5 Heads of Income (Salary, House Property, PGBP, Capital Gains, Other Sources), Clubbing, Set-off, Deductions (Chapter VI-A), Total Income Computation, TDS/TCS & Advance Tax, Filing of Returns', orderNum: 1, subtopics: [{ id: 's120', title: 'Section 115BAC Default New Tax Regime vs Old Regime', orderNum: 1 }] }] },
          { id: 'int_p3_secB', chapterNumber: 2, title: 'Section B: Goods and Services Tax (50 Marks)', topics: [{ id: 'p3_sB_t1', title: 'Concept of Supply (Sec 7), Charge of GST (Sec 9), Composition Scheme (Sec 10), Place of Supply, Time & Value of Supply, Input Tax Credit (ITC - Sec 16 to 18), Registration, Tax Invoice, Accounts, Returns', orderNum: 1, subtopics: [{ id: 's121', title: 'Rule 36(4) and GSTR-2B ITC reconciliation', orderNum: 1 }] }] },
        ],
      },

      // GROUP II
      {
        id: 'ca_int_p4',
        paperNumber: 4,
        title: 'Cost and Management Accounting',
        code: 'INT-P4',
        marks: 100,
        durationMinutes: 180,
        group: 'Group II',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-intermediate',
        chapters: [
          { id: 'int_p4_c1', chapterNumber: 1, title: 'Introduction & Cost Sheet', topics: [{ id: 'p4_t1', title: 'Cost Sheet preparation, elements of cost', orderNum: 1, subtopics: [{ id: 's130', title: 'Cost accounting classification', orderNum: 1 }] }] },
          { id: 'int_p4_c2', chapterNumber: 2, title: 'Material Cost, Employee Cost & Overheads', topics: [{ id: 'p4_t2', title: 'EOQ, Inventory levels, Labour turnover, Primary & Secondary overhead distribution', orderNum: 1, subtopics: [{ id: 's131', title: 'Machine hour rate and under/over absorption', orderNum: 1 }] }] },
          { id: 'int_p4_c3', chapterNumber: 3, title: 'Activity Based Costing (ABC)', topics: [{ id: 'p4_t3', title: 'Cost pools, Cost drivers, and Traditional vs ABC comparison', orderNum: 1, subtopics: [{ id: 's132', title: 'Product cost distortion identification', orderNum: 1 }] }] },
          { id: 'int_p4_c4', chapterNumber: 4, title: 'Cost Accounting Systems', topics: [{ id: 'p4_t4', title: 'Non-integrated and Integrated accounting, Reconciliation of cost and financial profits', orderNum: 1, subtopics: [{ id: 's133', title: 'Cost ledger accounting entries', orderNum: 1 }] }] },
          { id: 'int_p4_c5', chapterNumber: 5, title: 'Methods of Costing', topics: [{ id: 'p4_t5', title: 'Single Output/Unit Costing, Job Costing, Batch Costing, Service Costing, Process & Operation Costing, Joint Products & By-Products', orderNum: 1, subtopics: [{ id: 's134', title: 'Equivalent units and inter-process profits', orderNum: 1 }] }] },
          { id: 'int_p4_c6', chapterNumber: 6, title: 'Cost Control and Analysis', topics: [{ id: 'p4_t6', title: 'Standard Costing & Variance Analysis (Material, Labour, Overheads), Marginal Costing & Cost-Volume-Profit (CVP) Analysis, Budget and Budgetary Control', orderNum: 1, subtopics: [{ id: 's135', title: 'Break-even point, Margin of Safety, Key factor decisions', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_int_p5',
        paperNumber: 5,
        title: 'Auditing and Ethics',
        code: 'INT-P5',
        marks: 100,
        durationMinutes: 180,
        group: 'Group II',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-intermediate',
        chapters: [
          { id: 'int_p5_c1', chapterNumber: 1, title: 'Nature, Objective and Scope of Audit (SA 200 series)', topics: [{ id: 'p5_t1', title: 'Standards on Auditing, Professional Skepticism, Inherent Limitations', orderNum: 1, subtopics: [{ id: 's140', title: 'Engagement letter (SA 210), Quality control (SQC 1)', orderNum: 1 }] }] },
          { id: 'int_p5_c2', chapterNumber: 2, title: 'Audit Strategy, Audit Planning and Audit Programme (SA 300 series)', topics: [{ id: 'p5_t2', title: 'Materiality (SA 320), Audit Documentation (SA 230)', orderNum: 1, subtopics: [{ id: 's141', title: 'Risk assessment and internal control (SA 315)', orderNum: 1 }] }] },
          { id: 'int_p5_c3', chapterNumber: 3, title: 'Risk Assessment and Internal Control', topics: [{ id: 'p5_t3', title: 'Evaluation of Internal Control, Internal Financial Controls (IFC), Automated Environment', orderNum: 1, subtopics: [{ id: 's142', title: 'IT General Controls and Application Controls', orderNum: 1 }] }] },
          { id: 'int_p5_c4', chapterNumber: 4, title: 'Audit Evidence (SA 500 series)', topics: [{ id: 'p5_t4', title: 'Sufficient appropriate audit evidence, External confirmations (SA 505), Analytical procedures (SA 520), Audit sampling (SA 530)', orderNum: 1, subtopics: [{ id: 's143', title: 'Subsequent events (SA 560), Going concern (SA 570)', orderNum: 1 }] }] },
          { id: 'int_p5_c5', chapterNumber: 5, title: 'Audit of Items of Financial Statements', topics: [{ id: 'p5_t5', title: 'Vouching & Verification of Balance Sheet and P&L line items', orderNum: 1, subtopics: [{ id: 's144', title: 'Audit assertions: Existence, Completeness, Valuation', orderNum: 1 }] }] },
          { id: 'int_p5_c6', chapterNumber: 6, title: 'Audit Documentation and Audit Report (SA 700 series)', topics: [{ id: 'p5_t6', title: 'Types of audit opinions (Unmodified, Qualified, Adverse, Disclaimer - SA 705), CARO 2020 reporting', orderNum: 1, subtopics: [{ id: 's145', title: 'Emphasis of Matter and Key Audit Matters (SA 701)', orderNum: 1 }] }] },
          { id: 'int_p5_c7', chapterNumber: 7, title: 'Special Features of Audit of Different Entities & Ethics', topics: [{ id: 'p5_t7', title: 'Audit of Banks, Non-profit entities, Government audit, Code of Ethics principles', orderNum: 1, subtopics: [{ id: 's146', title: 'Threats to independence and fundamental ethical principles', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_int_p6',
        paperNumber: 6,
        title: 'Financial Management and Strategic Management',
        code: 'INT-P6',
        marks: 100,
        durationMinutes: 180,
        group: 'Group II',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-intermediate',
        chapters: [
          { id: 'int_p6_secA', chapterNumber: 1, title: 'Section A: Financial Management (50 Marks)', topics: [{ id: 'p6_sA_t1', title: 'Scope and Objectives of FM, Financial Analysis through Ratios, Sources of Finance, Cost of Capital (WACC), Financing Decisions (Capital Structure & EBIT-EPS Analysis), Leverages (Operating, Financial, Combined), Investment Decisions (Capital Budgeting - NPV, IRR, Payback), Dividend Decisions, Management of Working Capital', orderNum: 1, subtopics: [{ id: 's150', title: 'Operating and Cash Conversion Cycle, Capital rationing', orderNum: 1 }] }] },
          { id: 'int_p6_secB', chapterNumber: 2, title: 'Section B: Strategic Management (50 Marks)', topics: [{ id: 'p6_sB_t1', title: 'Introduction to Strategic Management, Strategic Analysis: External Environment (Porter 5 Forces, PESTLE), Strategic Analysis: Internal Environment (VRIO, Value Chain), Strategic Choices (Corporate, Business, Functional Levels), Strategy Implementation and Control (Balanced Scorecard, Digital Transformation)', orderNum: 1, subtopics: [{ id: 's151', title: 'Ansoff Matrix, BCG Growth-Share Matrix, Porter Generic Strategies', orderNum: 1 }] }] },
        ],
      },
    ],
  },

  ca_final: {
    track: 'ca_final',
    trackName: 'CA Final',
    badge: 'ICAI New Scheme',
    activeSyllabusVersion: 'ICAI_FINAL_NEW_SCHEME',
    versions: [
      {
        versionId: 'ICAI_FINAL_NEW_SCHEME',
        examTrack: 'ca_final',
        title: 'ICAI Final New Scheme (6 Papers + SPOM)',
        effectiveFrom: '2023-07-01',
        applicableSessions: ['May 2024', 'November 2024', 'May 2025', 'November 2025'],
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-final',
        lastVerifiedDate: '2025-01-10',
        isApproved: true,
        description: 'New Scheme curriculum for CA Final consisting of Group I (3 Papers), Group II (3 Papers), plus mandatory Self-Paced Online Modules (SPOM Set A and Set B).',
      },
    ],
    papers: [
      // GROUP I
      {
        id: 'ca_fin_p1',
        paperNumber: 1,
        title: 'Financial Reporting',
        code: 'FIN-P1',
        marks: 100,
        durationMinutes: 180,
        group: 'Group I',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-final',
        chapters: [
          { id: 'fin_p1_c1', chapterNumber: 1, title: 'Application of Indian Accounting Standards (Ind AS)', topics: [{ id: 'fin_t1', title: 'Ind AS on Presentation of Items in Financial Statements, Measurement based on Accounting Policies, Income Statement, Assets, Liabilities, Financial Instruments (Ind AS 32, 107, 109)', orderNum: 1, subtopics: [{ id: 's200', title: 'Classification and measurement of financial assets/liabilities, Impairment (ECL)', orderNum: 1 }] }] },
          { id: 'fin_p1_c2', chapterNumber: 2, title: 'Ind AS on Group Accounting (Business Combinations & Consolidation)', topics: [{ id: 'fin_t2', title: 'Business Combinations (Ind AS 103), Consolidated Financial Statements (Ind AS 110), Joint Arrangements (Ind AS 111), Associates (Ind AS 28)', orderNum: 1, subtopics: [{ id: 's201', title: 'Goodwill/Gain on bargain purchase, Non-controlling interest valuation', orderNum: 1 }] }] },
          { id: 'fin_p1_c3', chapterNumber: 3, title: 'Accounting and Reporting of Financial Instruments', topics: [{ id: 'fin_t3', title: 'Derivatives, Embedded Derivatives, Hedge Accounting', orderNum: 1, subtopics: [{ id: 's202', title: 'Fair value hedge and cash flow hedge mechanics', orderNum: 1 }] }] },
          { id: 'fin_p1_c4', chapterNumber: 4, title: 'Ind AS 115: Revenue from Contracts with Customers & Ind AS 116: Leases', topics: [{ id: 'fin_t4', title: '5-step revenue model, Right-of-Use Asset, Lease Liability accounting', orderNum: 1, subtopics: [{ id: 's203', title: 'Variable consideration, contract modifications, sale and leaseback', orderNum: 1 }] }] },
          { id: 'fin_p1_c5', chapterNumber: 5, title: 'Analysis of Financial Statements & Professional Ethics', topics: [{ id: 'fin_t5', title: 'Ind AS 102 Share-based Payment, Ind AS 33 EPS, Ind AS 12 Income Taxes, Integrated Reporting & BRSR', orderNum: 1, subtopics: [{ id: 's204', title: 'Deferred tax assets/liabilities, Business Responsibility and Sustainability Reporting', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_fin_p2',
        paperNumber: 2,
        title: 'Advanced Financial Management',
        code: 'FIN-P2',
        marks: 100,
        durationMinutes: 180,
        group: 'Group I',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-final',
        chapters: [
          { id: 'fin_p2_c1', chapterNumber: 1, title: 'Financial Policy and Corporate Strategy', topics: [{ id: 'fin_p2_t1', title: 'Strategic Financial Management Framework', orderNum: 1, subtopics: [{ id: 's210', title: 'Balancing financial goals with sustainable growth', orderNum: 1 }] }] },
          { id: 'fin_p2_c2', chapterNumber: 2, title: 'Risk Management & Derivatives', topics: [{ id: 'fin_p2_t2', title: 'Identification and evaluation of financial risks, Futures, Options, Swaps, Value at Risk (VaR)', orderNum: 1, subtopics: [{ id: 's211', title: 'Black-Scholes model, Binomial option pricing, Interest rate swaps', orderNum: 1 }] }] },
          { id: 'fin_p2_c3', chapterNumber: 3, title: 'Advanced Capital Budgeting Decisions', topics: [{ id: 'fin_p2_t3', title: 'Project risk evaluation, Sensitivity analysis, Simulation, Adjusted Present Value (APV)', orderNum: 1, subtopics: [{ id: 's212', title: 'Real options in capital budgeting', orderNum: 1 }] }] },
          { id: 'fin_p2_c4', chapterNumber: 4, title: 'Security Analysis & Portfolio Management', topics: [{ id: 'fin_p2_t4', title: 'Fundamental and Technical Analysis, Markowitz Portfolio Theory, CAPM, Arbitrage Pricing Theory (APT), Sharpe/Treynor/Jensen Ratios', orderNum: 1, subtopics: [{ id: 's213', title: 'Portfolio rebalancing and performance attribution', orderNum: 1 }] }] },
          { id: 'fin_p2_c5', chapterNumber: 5, title: 'International Financial Management', topics: [{ id: 'fin_p2_t5', title: 'Forex market, Exchange rate determination, Purchasing Power Parity, Interest Rate Parity, Hedging transaction/economic exposure', orderNum: 1, subtopics: [{ id: 's214', title: 'Currency forwards, options, money market hedge', orderNum: 1 }] }] },
          { id: 'fin_p2_c6', chapterNumber: 6, title: 'Mergers, Acquisitions & Corporate Restructuring', topics: [{ id: 'fin_p2_t6', title: 'Valuation of business, Swap ratios, Post-merger financial performance, Takeover defenses', orderNum: 1, subtopics: [{ id: 's215', title: 'Free cash flow to firm (FCFF) and to equity (FCFE)', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_fin_p3',
        paperNumber: 3,
        title: 'Advanced Auditing, Assurance and Professional Ethics',
        code: 'FIN-P3',
        marks: 100,
        durationMinutes: 180,
        group: 'Group I',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-final',
        chapters: [
          { id: 'fin_p3_c1', chapterNumber: 1, title: 'Quality Control and Engagement Standards', topics: [{ id: 'fin_p3_t1', title: 'SQC 1, SA 220 (Revised), Standards on Auditing comprehensive mastery', orderNum: 1, subtopics: [{ id: 's220', title: 'Engagement quality control reviews', orderNum: 1 }] }] },
          { id: 'fin_p3_c2', chapterNumber: 2, title: 'Audit Planning, Strategy and Execution', topics: [{ id: 'fin_p3_t2', title: 'Risk assessment, Forensic auditing, Fraud detection (SA 240)', orderNum: 1, subtopics: [{ id: 's221', title: 'Auditing digital and automated environments', orderNum: 1 }] }] },
          { id: 'fin_p3_c3', chapterNumber: 3, title: 'Specialised Areas and Auditing of Consolidated Financial Statements', topics: [{ id: 'fin_p3_t3', title: 'Group audits (SA 600), Using work of internal auditor (SA 610), Auditor expert (SA 620)', orderNum: 1, subtopics: [{ id: 's222', title: 'Audit of NBFCs and Public Sector Undertakings', orderNum: 1 }] }] },
          { id: 'fin_p3_c4', chapterNumber: 4, title: 'Audit Reports & Reporting under Regulations', topics: [{ id: 'fin_p3_t4', title: 'SA 700, 701, 705, 706, CARO 2020, Secretarial Audit & SEBI LODR Regulations compliance', orderNum: 1, subtopics: [{ id: 's223', title: 'Key Audit Matters drafting and evaluation', orderNum: 1 }] }] },
          { id: 'fin_p3_c5', chapterNumber: 5, title: 'Professional Ethics and Code of Conduct', topics: [{ id: 'fin_p3_t5', title: 'Chartered Accountants Act 1949, First and Second Schedules, Disciplinary mechanism, Council Guidelines', orderNum: 1, subtopics: [{ id: 's224', title: 'NOCLAR (Non-compliance with laws and regulations) framework', orderNum: 1 }] }] },
        ],
      },

      // GROUP II
      {
        id: 'ca_fin_p4',
        paperNumber: 4,
        title: 'Direct Tax Laws & International Taxation',
        code: 'FIN-P4',
        marks: 100,
        durationMinutes: 180,
        group: 'Group II',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-final',
        chapters: [
          { id: 'fin_p4_c1', chapterNumber: 1, title: 'Comprehensive Income Tax Law for Corporates and Non-Corporates', topics: [{ id: 'fin_p4_t1', title: 'Assessment of companies (MAT u/s 115JB, concessional tax regimes u/s 115BAA/115BAB), Trusts, AOP/BOI, Business Trusts (REITs, InvITs)', orderNum: 1, subtopics: [{ id: 's230', title: 'Tax audit u/s 44AB and penalties', orderNum: 1 }] }] },
          { id: 'fin_p4_c2', chapterNumber: 2, title: 'Tax Administration, Assessment and Dispute Resolution', topics: [{ id: 'fin_p4_t2', title: 'Appeals, Revisions, Search & Seizure u/s 132, Faceless Assessment Schemes, Dispute Resolution Committee (DRC)', orderNum: 1, subtopics: [{ id: 's231', title: 'Settlement of disputes and settlement commission updates', orderNum: 1 }] }] },
          { id: 'fin_p4_c3', chapterNumber: 3, title: 'International Taxation', topics: [{ id: 'fin_p4_t3', title: 'Transfer Pricing (Arm’s length price methods, Secondary adjustment, Safe harbour rules), Double Taxation Avoidance Agreements (DTAA - Sec 90/91, MLI, BEPS Action Plans), Equalisation Levy, Non-resident taxation', orderNum: 1, subtopics: [{ id: 's232', title: 'Significant Economic Presence (SEP) and POEM determination', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_fin_p5',
        paperNumber: 5,
        title: 'Indirect Tax Laws',
        code: 'FIN-P5',
        marks: 100,
        durationMinutes: 180,
        group: 'Group II',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-final',
        chapters: [
          { id: 'fin_p5_c1', chapterNumber: 1, title: 'Goods and Services Tax (GST) - Advanced Provisions', topics: [{ id: 'fin_p5_t1', title: 'Complex Place of Supply rules, Valuation in special cases, Input Tax Credit restrictions & blockages, Refunds of unutilized ITC, Demands, Recovery, Search, Seizure, Arrest, Appeals and Revision, Advance Ruling, Anti-Profiteering, Liability to pay in certain cases', orderNum: 1, subtopics: [{ id: 's240', title: 'Inverted duty structure refund calculations', orderNum: 1 }] }] },
          { id: 'fin_p5_c2', chapterNumber: 2, title: 'Customs Law and Foreign Trade Policy (FTP)', topics: [{ id: 'fin_p5_t2', title: 'Levy of Customs duty, Types of duties, Valuation of imported and export goods, Warehousing, Duty drawback, Advance Authorisation, EPCG Scheme, SEZ provisions', orderNum: 1, subtopics: [{ id: 's241', title: 'Baggage rules, postal imports, and trade remedies', orderNum: 1 }] }] },
        ],
      },
      {
        id: 'ca_fin_p6',
        paperNumber: 6,
        title: 'Integrated Business Solutions (Multidisciplinary Case Study)',
        code: 'FIN-P6',
        marks: 100,
        durationMinutes: 240,
        group: 'Group II',
        hasNegativeMarking: false,
        officialSourceUrl: 'https://www.icai.org/post/syllabus-nset-final',
        chapters: [
          { id: 'fin_p6_c1', chapterNumber: 1, title: 'Multidisciplinary Case Studies', topics: [{ id: 'fin_p6_t1', title: 'Integration of Financial Reporting, Advanced Financial Management, Advanced Auditing, Corporate Laws, Direct Tax, and Indirect Tax across real-life corporate scenarios', orderNum: 1, subtopics: [{ id: 's250', title: 'Evaluation of corporate restructurings, cross-border transactions, tax planning vs evasion, corporate governance failure analysis', orderNum: 1 }] }] },
        ],
      },
    ],
  },
}

/**
 * Normalizes strings for robust fuzzy comparison (removes non-alphanumeric chars, lowercases)
 */
export function normalizeCurriculumKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

/**
 * Searches the entire curriculum registry for a matching paper, chapter, or subject.
 * Tolerates URL-encoded strings, kebab-case slugs, and partial title matches.
 */
export function findCurriculumStructure(subjectName: string) {
  const normTarget = normalizeCurriculumKey(subjectName)
  if (!normTarget) return null

  for (const trackKey of Object.keys(CURRICULUM_REGISTRY) as Array<keyof typeof CURRICULUM_REGISTRY>) {
    const track = CURRICULUM_REGISTRY[trackKey]
    for (const paper of track.papers) {
      const normPaperTitle = normalizeCurriculumKey(paper.title)
      const normPaperId = normalizeCurriculumKey(paper.id)

      if (
        normPaperTitle === normTarget ||
        normPaperId === normTarget ||
        normPaperTitle.includes(normTarget) ||
        normTarget.includes(normPaperTitle)
      ) {
        return { track, paper, type: 'paper' as const }
      }

      for (const ch of paper.chapters) {
        const normChapterTitle = normalizeCurriculumKey(ch.title)
        const normChapterId = normalizeCurriculumKey(ch.id)

        if (
          normChapterTitle === normTarget ||
          normChapterId === normTarget ||
          normChapterTitle.includes(normTarget) ||
          normTarget.includes(normChapterTitle)
        ) {
          return { track, paper, chapter: ch, type: 'chapter' as const }
        }
      }
    }
  }
  return null
}

/**
 * Searches the entire registry across all 4 tracks to find a topic or subtopic by ID or title.
 */
export function findRegistryTopic(topicId: string, subjectHint?: string) {
  const normId = normalizeCurriculumKey(topicId)
  if (!normId) return null

  const normHint = subjectHint ? normalizeCurriculumKey(subjectHint) : ''
  let bestMatch: any = null

  for (const track of Object.values(CURRICULUM_REGISTRY)) {
    for (const paper of track.papers) {
      for (const ch of paper.chapters) {
        for (const topic of ch.topics) {
          for (const sub of topic.subtopics) {
            const matchId = normalizeCurriculumKey(sub.id) === normId
            const matchTitle = normalizeCurriculumKey(sub.title) === normId
            const matchSubIdExact = sub.id.toLowerCase() === topicId.toLowerCase()

            if (matchId || matchTitle || matchSubIdExact) {
              const subjectTitle = track.track === 'gate_cse' ? ch.title : paper.title
              const candidate = {
                id: sub.id,
                subject: subjectTitle,
                topic: topic.title,
                subtopic: sub.title,
                description: sub.description || `${topic.title} — ${sub.title}`,
                order_num: sub.orderNum,
                progress: null,
                track: track.trackName,
              }

              // If subject hint matches paper or chapter, prefer immediately
              if (
                normHint &&
                (normalizeCurriculumKey(subjectTitle).includes(normHint) ||
                  normHint.includes(normalizeCurriculumKey(subjectTitle)))
              ) {
                return candidate
              }

              if (!bestMatch) {
                bestMatch = candidate
              }
            }
          }
        }
      }
    }
  }

  return bestMatch
}

/**
 * Returns all topics for a given subject (paper or chapter) from the registry.
 */
export function getCurriculumTopicsForSubject(subjectName: string) {
  const structure = findCurriculumStructure(subjectName)
  if (!structure) return []

  const topicsList: Array<{
    id: string
    subject: string
    topic: string
    subtopic: string
    description?: string
    order_num: number
  }> = []

  let order = 1
  if (structure.type === 'chapter' && structure.chapter) {
    const ch = structure.chapter
    for (const t of ch.topics) {
      for (const s of t.subtopics) {
        topicsList.push({
          id: s.id,
          subject: ch.title,
          topic: t.title,
          subtopic: s.title,
          description: s.description || `${ch.title} — ${t.title}`,
          order_num: order++,
        })
      }
    }
  } else if (structure.type === 'paper' && structure.paper) {
    const p = structure.paper
    for (const ch of p.chapters) {
      for (const t of ch.topics) {
        for (const s of t.subtopics) {
          topicsList.push({
            id: s.id,
            subject: p.title,
            topic: ch.title,
            subtopic: s.title,
            description: s.description || `${ch.title} — ${t.title}`,
            order_num: order++,
          })
        }
      }
    }
  }

  return topicsList
}
