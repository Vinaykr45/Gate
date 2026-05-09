-- ============================================================
-- GATE CSE 2025 Complete Syllabus Seed
-- Run this in Supabase SQL Editor
-- ============================================================

-- Clear existing data (optional — comment out to append)
-- DELETE FROM learning_topics;

INSERT INTO learning_topics (subject, topic, subtopic, description, order_num) VALUES

-- ─────────────────────────────────────────────
-- 1. ENGINEERING MATHEMATICS
-- ─────────────────────────────────────────────
('Engineering Mathematics', 'Discrete Mathematics', 'Propositional and First Order Logic', 'Truth tables, predicates, quantifiers, logical equivalences', 10),
('Engineering Mathematics', 'Discrete Mathematics', 'Sets, Relations and Functions', 'Set operations, Cartesian product, equivalence relations, functions', 20),
('Engineering Mathematics', 'Discrete Mathematics', 'Partial Orders and Lattices', 'Partial orders, Hasse diagrams, lattices, Boolean algebra', 30),
('Engineering Mathematics', 'Discrete Mathematics', 'Graphs', 'Graph representations, connectivity, paths, cycles, coloring, planarity', 40),
('Engineering Mathematics', 'Discrete Mathematics', 'Combinatorics', 'Counting, permutations, combinations, pigeonhole principle, recurrences', 50),

('Engineering Mathematics', 'Linear Algebra', 'Matrices', 'Matrix operations, transpose, inverse, rank, determinant', 60),
('Engineering Mathematics', 'Linear Algebra', 'System of Linear Equations', 'Gaussian elimination, consistency, solution sets', 70),
('Engineering Mathematics', 'Linear Algebra', 'Eigenvalues and Eigenvectors', 'Characteristic equation, diagonalization, Cayley-Hamilton', 80),
('Engineering Mathematics', 'Linear Algebra', 'LU Decomposition', 'LU factorization, forward and backward substitution', 90),

('Engineering Mathematics', 'Calculus', 'Limits and Continuity', 'Limits, L-Hopital rule, continuity, differentiability', 100),
('Engineering Mathematics', 'Calculus', 'Differentiation', 'Chain rule, partial derivatives, gradient, maxima/minima', 110),
('Engineering Mathematics', 'Calculus', 'Integration', 'Definite and indefinite integrals, techniques of integration', 120),
('Engineering Mathematics', 'Calculus', 'Mean Value Theorems', 'Rolles theorem, Lagrange MVT, Taylor series', 130),

('Engineering Mathematics', 'Probability and Statistics', 'Probability Basics', 'Sample space, events, conditional probability, Bayes theorem', 140),
('Engineering Mathematics', 'Probability and Statistics', 'Random Variables', 'Discrete and continuous, PDF, CDF, expectation, variance', 150),
('Engineering Mathematics', 'Probability and Statistics', 'Distributions', 'Uniform, Binomial, Poisson, Exponential, Normal distributions', 160),
('Engineering Mathematics', 'Probability and Statistics', 'Statistics', 'Mean, median, mode, standard deviation, correlation, regression', 170),

-- ─────────────────────────────────────────────
-- 2. DIGITAL LOGIC
-- ─────────────────────────────────────────────
('Digital Logic', 'Boolean Algebra', 'Boolean Expressions and Minimization', 'Boolean laws, SOP, POS, Karnaugh maps, Quine-McCluskey', 10),
('Digital Logic', 'Boolean Algebra', 'Logic Gates', 'AND, OR, NOT, NAND, NOR, XOR, XNOR gate implementations', 20),
('Digital Logic', 'Combinational Circuits', 'Multiplexers and Demultiplexers', 'MUX/DEMUX design, function implementation using MUX', 30),
('Digital Logic', 'Combinational Circuits', 'Encoders and Decoders', 'Priority encoder, BCD decoder, 7-segment display', 40),
('Digital Logic', 'Combinational Circuits', 'Adders and Subtractors', 'Half adder, full adder, ripple carry, carry lookahead adder', 50),
('Digital Logic', 'Combinational Circuits', 'Comparators and ALU', 'Magnitude comparator, arithmetic logic unit design', 60),
('Digital Logic', 'Sequential Circuits', 'Flip-Flops', 'SR, D, JK, T flip-flops, characteristic equations, state tables', 70),
('Digital Logic', 'Sequential Circuits', 'Counters', 'Synchronous/asynchronous counters, ring counter, Johnson counter', 80),
('Digital Logic', 'Sequential Circuits', 'Shift Registers', 'SISO, SIPO, PISO, PIPO, universal shift register', 90),
('Digital Logic', 'Sequential Circuits', 'Finite State Machines', 'Mealy and Moore machines, state minimization, state transition', 100),
('Digital Logic', 'Number Systems', 'Number Representations', 'Binary, octal, hex conversions, BCD, Gray code', 110),
('Digital Logic', 'Number Systems', 'Arithmetic in Binary', 'Signed numbers, 1s complement, 2s complement, overflow detection', 120),

-- ─────────────────────────────────────────────
-- 3. COMPUTER ORGANIZATION & ARCHITECTURE
-- ─────────────────────────────────────────────
('Computer Organization and Architecture', 'Machine Instructions', 'Instruction Set Architecture', 'RISC vs CISC, addressing modes, instruction formats', 10),
('Computer Organization and Architecture', 'Machine Instructions', 'ALU Design', 'Arithmetic operations, logic operations, status flags', 20),
('Computer Organization and Architecture', 'Data Path and Control', 'Hardwired vs Microprogrammed Control', 'Control unit design, microoperations, microprogramming', 30),
('Computer Organization and Architecture', 'Data Path and Control', 'Pipelining', 'Pipeline stages, hazards (structural, data, control), stalling, forwarding', 40),
('Computer Organization and Architecture', 'Data Path and Control', 'Pipeline Performance', 'Speedup, efficiency, throughput, branch prediction', 50),
('Computer Organization and Architecture', 'Memory Organization', 'Cache Memory', 'Cache mapping (direct, set-associative, fully associative), replacement policies, write policies', 60),
('Computer Organization and Architecture', 'Memory Organization', 'Main Memory', 'DRAM, SRAM, memory interleaving, memory hierarchy', 70),
('Computer Organization and Architecture', 'Memory Organization', 'Virtual Memory', 'Paging, segmentation, page tables, TLB, page faults', 80),
('Computer Organization and Architecture', 'I/O Organization', 'I/O Interfaces', 'Programmed I/O, interrupt driven I/O, DMA', 90),
('Computer Organization and Architecture', 'I/O Organization', 'Secondary Storage', 'Disk structure, seek time, rotational latency, disk scheduling', 100),

-- ─────────────────────────────────────────────
-- 4. PROGRAMMING AND DATA STRUCTURES
-- ─────────────────────────────────────────────
('Programming and Data Structures', 'Programming in C', 'Data Types and Operators', 'Primitive types, type conversions, operators, expressions', 10),
('Programming and Data Structures', 'Programming in C', 'Control Flow', 'if-else, switch, loops, break, continue, goto', 20),
('Programming and Data Structures', 'Programming in C', 'Functions and Recursion', 'Function calls, call stack, recursion, tail recursion', 30),
('Programming and Data Structures', 'Programming in C', 'Arrays and Strings', 'Array operations, multi-dimensional arrays, string functions', 40),
('Programming and Data Structures', 'Programming in C', 'Pointers', 'Pointer arithmetic, pointers to functions, dynamic memory (malloc/free)', 50),
('Programming and Data Structures', 'Programming in C', 'Structures and Unions', 'struct, union, typedef, bit fields, padding/alignment', 60),
('Programming and Data Structures', 'Linear Data Structures', 'Stacks and Queues', 'Array/linked list implementation, applications (infix/postfix, BFS)', 70),
('Programming and Data Structures', 'Linear Data Structures', 'Linked Lists', 'Singly, doubly, circular linked lists, operations, applications', 80),
('Programming and Data Structures', 'Trees', 'Binary Trees', 'Traversals (in/pre/post/level), properties, height, diameter', 90),
('Programming and Data Structures', 'Trees', 'Binary Search Trees', 'BST operations, AVL trees, rotations, balancing', 100),
('Programming and Data Structures', 'Trees', 'Heaps', 'Min/max heap, heapify, heap operations, priority queue', 110),
('Programming and Data Structures', 'Graphs', 'Graph Representation', 'Adjacency matrix/list, BFS, DFS, complexity', 120),
('Programming and Data Structures', 'Graphs', 'Graph Algorithms', 'Shortest path (Dijkstra, Bellman-Ford), MST (Prim, Kruskal)', 130),
('Programming and Data Structures', 'Hashing', 'Hash Tables', 'Hash functions, collision resolution (chaining, open addressing), load factor', 140),

-- ─────────────────────────────────────────────
-- 5. ALGORITHMS
-- ─────────────────────────────────────────────
('Algorithms', 'Algorithm Analysis', 'Asymptotic Notation', 'Big-O, Big-Omega, Big-Theta, recurrence relations, Master theorem', 10),
('Algorithms', 'Algorithm Analysis', 'Time and Space Complexity', 'Best/worst/average case, amortized analysis', 20),
('Algorithms', 'Sorting', 'Comparison Based Sorting', 'Bubble, Selection, Insertion, Merge, Quick, Heap sort - complexity analysis', 30),
('Algorithms', 'Sorting', 'Non-Comparison Sorting', 'Counting sort, Radix sort, Bucket sort - when to use', 40),
('Algorithms', 'Searching', 'Searching Algorithms', 'Linear search, binary search, interpolation search', 50),
('Algorithms', 'Algorithm Design', 'Divide and Conquer', 'Merge sort, Quick sort, Binary search, Strassen matrix multiplication', 60),
('Algorithms', 'Algorithm Design', 'Greedy Algorithms', 'Activity selection, Huffman coding, fractional knapsack, Prim, Kruskal', 70),
('Algorithms', 'Algorithm Design', 'Dynamic Programming', 'Memoization, tabulation, LCS, LIS, 0/1 knapsack, matrix chain, edit distance', 80),
('Algorithms', 'Algorithm Design', 'Backtracking', 'N-Queens, subset sum, graph coloring, branch and bound', 90),
('Algorithms', 'Graph Algorithms', 'Shortest Paths', 'Dijkstra, Bellman-Ford, Floyd-Warshall algorithms', 100),
('Algorithms', 'Graph Algorithms', 'Spanning Trees', 'Prim algorithm, Kruskal algorithm, cut property', 110),
('Algorithms', 'Graph Algorithms', 'Topological Sort and SCC', 'Kahn algorithm, DFS-based topological sort, Tarjan/Kosaraju SCC', 120),
('Algorithms', 'String Algorithms', 'Pattern Matching', 'Naive, KMP, Rabin-Karp, string matching automata', 130),

-- ─────────────────────────────────────────────
-- 6. THEORY OF COMPUTATION
-- ─────────────────────────────────────────────
('Theory of Computation', 'Regular Languages', 'Finite Automata', 'DFA, NFA, epsilon-NFA, equivalence, minimization', 10),
('Theory of Computation', 'Regular Languages', 'Regular Expressions', 'RE to NFA, NFA to DFA, applications', 20),
('Theory of Computation', 'Regular Languages', 'Properties of Regular Languages', 'Closure properties, pumping lemma, decidability', 30),
('Theory of Computation', 'Context-Free Languages', 'Context-Free Grammars', 'CFG definition, derivation, parse trees, ambiguity', 40),
('Theory of Computation', 'Context-Free Languages', 'Pushdown Automata', 'PDA definition, acceptance by empty stack/final state, NPDA', 50),
('Theory of Computation', 'Context-Free Languages', 'Properties of CFLs', 'Closure properties, pumping lemma for CFLs, CYK algorithm', 60),
('Theory of Computation', 'Turing Machines', 'Turing Machine Basics', 'TM definition, configurations, language acceptance, variants', 70),
('Theory of Computation', 'Turing Machines', 'Decidability', 'Decidable vs undecidable, halting problem, reduction techniques', 80),
('Theory of Computation', 'Complexity', 'P and NP', 'P, NP, NP-complete, NP-hard, Cook-Levin theorem', 90),
('Theory of Computation', 'Complexity', 'NP-Complete Problems', 'SAT, 3-SAT, vertex cover, clique, Hamiltonian cycle, polynomial reduction', 100),

-- ─────────────────────────────────────────────
-- 7. COMPILER DESIGN
-- ─────────────────────────────────────────────
('Compiler Design', 'Lexical Analysis', 'Lexical Analysis Basics', 'Tokens, lexemes, patterns, role of lexer, symbol table', 10),
('Compiler Design', 'Lexical Analysis', 'Finite Automata in Lexer', 'RE to NFA to DFA for tokenization, lex tool', 20),
('Compiler Design', 'Syntax Analysis', 'Top-Down Parsing', 'Recursive descent, LL(1) grammars, FIRST and FOLLOW sets, parse table', 30),
('Compiler Design', 'Syntax Analysis', 'Bottom-Up Parsing', 'LR(0), SLR(1), LALR(1), LR(1) parsers, shift-reduce conflicts', 40),
('Compiler Design', 'Semantic Analysis', 'Syntax-Directed Translation', 'Attributes, S-attributed, L-attributed definitions', 50),
('Compiler Design', 'Semantic Analysis', 'Type Checking', 'Type systems, type inference, type conversion', 60),
('Compiler Design', 'Intermediate Code', 'Intermediate Representations', 'Three address code, DAG, quadruples, triples', 70),
('Compiler Design', 'Code Optimization', 'Local Optimizations', 'Common subexpression elimination, dead code removal, constant folding', 80),
('Compiler Design', 'Code Optimization', 'Global Optimizations', 'Data flow analysis, loop optimization, strength reduction', 90),
('Compiler Design', 'Code Generation', 'Register Allocation and Code Generation', 'DAG-based code generation, register allocation, instruction selection', 100),

-- ─────────────────────────────────────────────
-- 8. OPERATING SYSTEMS
-- ─────────────────────────────────────────────
('Operating System', 'Process Management', 'Process and Thread Concepts', 'Process vs thread, PCB, process states, context switching', 10),
('Operating System', 'Process Management', 'Inter-Process Communication', 'Shared memory, message passing, pipes, signals', 20),
('Operating System', 'Process Management', 'Synchronization', 'Critical section, mutex, semaphores, monitors, condition variables', 30),
('Operating System', 'Process Management', 'Classical Synchronization Problems', 'Producer-consumer, readers-writers, dining philosophers', 40),
('Operating System', 'CPU Scheduling', 'Scheduling Algorithms', 'FCFS, SJF, SRTF, Round Robin, Priority scheduling, multilevel queues', 50),
('Operating System', 'CPU Scheduling', 'Scheduling Metrics', 'CPU utilization, throughput, turnaround time, waiting time, response time', 60),
('Operating System', 'Deadlock', 'Deadlock Concepts', 'Necessary conditions, resource allocation graph, deadlock detection', 70),
('Operating System', 'Deadlock', 'Deadlock Handling', 'Prevention, avoidance (Banker algorithm), detection, recovery', 80),
('Operating System', 'Memory Management', 'Contiguous Memory Allocation', 'Fixed/variable partitioning, fragmentation, compaction, swapping', 90),
('Operating System', 'Memory Management', 'Paging', 'Page tables, multi-level paging, inverted page table, TLB, effective access time', 100),
('Operating System', 'Memory Management', 'Segmentation', 'Segment tables, segmentation with paging', 110),
('Operating System', 'Memory Management', 'Virtual Memory', 'Demand paging, page replacement algorithms (FIFO, LRU, Optimal, Clock)', 120),
('Operating System', 'File Systems', 'File System Concepts', 'File attributes, operations, access methods, directory structure', 130),
('Operating System', 'File Systems', 'File System Implementation', 'Allocation methods (contiguous, linked, indexed), i-nodes, free space management', 140),
('Operating System', 'File Systems', 'Disk Scheduling', 'FCFS, SSTF, SCAN, C-SCAN, LOOK disk scheduling algorithms', 150),

-- ─────────────────────────────────────────────
-- 9. DATABASES
-- ─────────────────────────────────────────────
('Databases', 'Relational Model', 'ER Model to Relational Schema', 'Entities, attributes, relationships, ER to relational mapping', 10),
('Databases', 'Relational Model', 'Relational Algebra', 'Select, project, join, union, difference, division operations', 20),
('Databases', 'Relational Model', 'Tuple Relational Calculus', 'TRC expressions, safety of expressions', 30),
('Databases', 'SQL', 'Basic SQL', 'DDL, DML, DCL, SELECT with WHERE, ORDER BY, GROUP BY, HAVING', 40),
('Databases', 'SQL', 'Joins and Subqueries', 'Inner, outer, cross join, correlated subqueries, EXISTS, IN', 50),
('Databases', 'SQL', 'Aggregate Functions and Views', 'COUNT, SUM, AVG, MIN, MAX, views, materialized views', 60),
('Databases', 'Normalization', 'Functional Dependencies', 'FD definition, Armstrong axioms, closure, canonical cover', 70),
('Databases', 'Normalization', 'Normal Forms', '1NF, 2NF, 3NF, BCNF — definitions, decomposition, lossless join', 80),
('Databases', 'Transactions', 'Transaction Concepts', 'ACID properties, transaction states, concurrent execution', 90),
('Databases', 'Transactions', 'Concurrency Control', 'Serializability, conflict serializability, 2PL, timestamp ordering', 100),
('Databases', 'Transactions', 'Recovery', 'Log-based recovery, undo/redo, checkpoints, ARIES', 110),
('Databases', 'Indexing', 'File Organization and Indexing', 'Heap, sequential file, primary/secondary/clustered indexes', 120),
('Databases', 'Indexing', 'B and B+ Trees', 'B-tree structure, insertion/deletion in B+ tree, tree height', 130),
('Databases', 'Indexing', 'Hashing', 'Static hashing, extendible hashing, linear hashing', 140),

-- ─────────────────────────────────────────────
-- 10. COMPUTER NETWORKS
-- ─────────────────────────────────────────────
('Computer Networks', 'Network Fundamentals', 'Network Models and Layering', 'OSI 7-layer model, TCP/IP 5-layer model, encapsulation', 10),
('Computer Networks', 'Network Fundamentals', 'Transmission Media and Data Rate', 'Bandwidth, throughput, latency, Nyquist rate, Shannon capacity', 20),
('Computer Networks', 'Data Link Layer', 'Framing and Error Detection', 'Framing methods, parity, checksum, CRC calculation', 30),
('Computer Networks', 'Data Link Layer', 'Error Correction', 'Hamming code, error correcting codes', 40),
('Computer Networks', 'Data Link Layer', 'Flow Control', 'Stop-and-wait, sliding window, Go-Back-N, Selective Repeat', 50),
('Computer Networks', 'Data Link Layer', 'MAC Protocols', 'ALOHA (pure/slotted), CSMA/CD, CSMA/CA, efficiency calculations', 60),
('Computer Networks', 'Data Link Layer', 'Ethernet and LAN', 'Ethernet frame, CSMA/CD, switches, VLANs, spanning tree', 70),
('Computer Networks', 'Network Layer', 'IP Addressing', 'IPv4 addressing, subnetting, CIDR, IPv6 basics', 80),
('Computer Networks', 'Network Layer', 'Routing Algorithms', 'Distance vector (RIP), link state (OSPF), path vector (BGP)', 90),
('Computer Networks', 'Network Layer', 'IP Protocol and Fragmentation', 'IPv4 header, fragmentation, reassembly, ICMP', 100),
('Computer Networks', 'Network Layer', 'NAT and ARP', 'Network address translation, ARP protocol, proxy ARP', 110),
('Computer Networks', 'Transport Layer', 'UDP Protocol', 'UDP header, unreliable delivery, use cases', 120),
('Computer Networks', 'Transport Layer', 'TCP Protocol', 'TCP header, connection setup (3-way handshake), teardown, state machine', 130),
('Computer Networks', 'Transport Layer', 'TCP Reliability and Flow Control', 'Sequence numbers, ACKs, retransmission, sliding window', 140),
('Computer Networks', 'Transport Layer', 'TCP Congestion Control', 'Slow start, congestion avoidance, fast retransmit, AIMD', 150),
('Computer Networks', 'Application Layer', 'DNS', 'Domain hierarchy, resolution process, iterative vs recursive, record types', 160),
('Computer Networks', 'Application Layer', 'HTTP and HTTPS', 'HTTP/1.1 vs HTTP/2, methods, status codes, cookies, TLS', 170),
('Computer Networks', 'Application Layer', 'Email Protocols', 'SMTP, POP3, IMAP — architecture and comparison', 180),
('Computer Networks', 'Application Layer', 'Other Protocols', 'FTP, DHCP, SNMP, NTP — purpose and key features', 190);

-- ---------------------------------------------
-- 11. GENERAL APTITUDE
-- ---------------------------------------------
('General Aptitude', 'Verbal Aptitude', 'Basic English grammar: tenses, articles, adjectives, prepositions, conjunctions, verb-noun agreement, and other parts of speech', 'Grammar basics for GATE', 200),
('General Aptitude', 'Verbal Aptitude', 'Basic vocabulary: words, idioms, and phrases in context', 'Vocabulary basics for GATE', 201),
('General Aptitude', 'Verbal Aptitude', 'Reading and comprehension', 'Reading comprehension', 202),
('General Aptitude', 'Verbal Aptitude', 'Narrative sequencing', 'Narrative sequencing', 203),
('General Aptitude', 'Quantitative Aptitude', 'Data interpretation: bar graphs, pie charts, other graphs, maps, and tables', 'Data interpretation', 204),
('General Aptitude', 'Quantitative Aptitude', '2-dimensional and 3-dimensional plots', 'Plots and charts', 205),
('General Aptitude', 'Quantitative Aptitude', 'Numerical computation and estimation', 'Numerical computation', 206),
('General Aptitude', 'Quantitative Aptitude', 'Ratios', 'Ratios', 207),
('General Aptitude', 'Quantitative Aptitude', 'Percentages', 'Percentages', 208),
('General Aptitude', 'Quantitative Aptitude', 'Powers, exponents, and logarithms', 'Powers and logs', 209),
('General Aptitude', 'Quantitative Aptitude', 'Permutations and combinations', 'Permutations and combinations', 210),
('General Aptitude', 'Quantitative Aptitude', 'Series', 'Series', 211),
('General Aptitude', 'Quantitative Aptitude', 'Mensuration and geometry', 'Geometry', 212),
('General Aptitude', 'Quantitative Aptitude', 'Elementary statistics and probability', 'Statistics and probability', 213),
('General Aptitude', 'Analytical Aptitude', 'Logic: deduction and induction', 'Logic basics', 214),
('General Aptitude', 'Analytical Aptitude', 'Analogy', 'Analogy', 215),
('General Aptitude', 'Analytical Aptitude', 'Numerical relations and reasoning', 'Numerical reasoning', 216),
('General Aptitude', 'Spatial Aptitude', 'Transformation of shapes', 'Shapes transformation', 217),
('General Aptitude', 'Spatial Aptitude', 'Translation', 'Translation', 218),
('General Aptitude', 'Spatial Aptitude', 'Rotation', 'Rotation', 219),
('General Aptitude', 'Spatial Aptitude', 'Scaling', 'Scaling', 220),
('General Aptitude', 'Spatial Aptitude', 'Mirroring', 'Mirroring', 221),
('General Aptitude', 'Spatial Aptitude', 'Assembling and grouping', 'Assembling shapes', 222),
('General Aptitude', 'Spatial Aptitude', 'Paper folding and cutting', 'Paper folding', 223),
('General Aptitude', 'Spatial Aptitude', 'Patterns in 2D and 3D', 'Patterns', 224);

