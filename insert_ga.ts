import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const rows = [
  { subject: 'General Aptitude', topic: 'Verbal Aptitude', subtopic: 'Basic English grammar: tenses, articles, adjectives, prepositions, conjunctions, verb-noun agreement, and other parts of speech', description: 'Grammar basics for GATE', order_num: 200 },
  { subject: 'General Aptitude', topic: 'Verbal Aptitude', subtopic: 'Basic vocabulary: words, idioms, and phrases in context', description: 'Vocabulary basics for GATE', order_num: 201 },
  { subject: 'General Aptitude', topic: 'Verbal Aptitude', subtopic: 'Reading and comprehension', description: 'Reading comprehension', order_num: 202 },
  { subject: 'General Aptitude', topic: 'Verbal Aptitude', subtopic: 'Narrative sequencing', description: 'Narrative sequencing', order_num: 203 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: 'Data interpretation: bar graphs, pie charts, other graphs, maps, and tables', description: 'Data interpretation', order_num: 204 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: '2-dimensional and 3-dimensional plots', description: 'Plots and charts', order_num: 205 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: 'Numerical computation and estimation', description: 'Numerical computation', order_num: 206 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: 'Ratios', description: 'Ratios', order_num: 207 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: 'Percentages', description: 'Percentages', order_num: 208 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: 'Powers, exponents, and logarithms', description: 'Powers and logs', order_num: 209 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: 'Permutations and combinations', description: 'Permutations and combinations', order_num: 210 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: 'Series', description: 'Series', order_num: 211 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: 'Mensuration and geometry', description: 'Geometry', order_num: 212 },
  { subject: 'General Aptitude', topic: 'Quantitative Aptitude', subtopic: 'Elementary statistics and probability', description: 'Statistics and probability', order_num: 213 },
  { subject: 'General Aptitude', topic: 'Analytical Aptitude', subtopic: 'Logic: deduction and induction', description: 'Logic basics', order_num: 214 },
  { subject: 'General Aptitude', topic: 'Analytical Aptitude', subtopic: 'Analogy', description: 'Analogy', order_num: 215 },
  { subject: 'General Aptitude', topic: 'Analytical Aptitude', subtopic: 'Numerical relations and reasoning', description: 'Numerical reasoning', order_num: 216 },
  { subject: 'General Aptitude', topic: 'Spatial Aptitude', subtopic: 'Transformation of shapes', description: 'Shapes transformation', order_num: 217 },
  { subject: 'General Aptitude', topic: 'Spatial Aptitude', subtopic: 'Translation', description: 'Translation', order_num: 218 },
  { subject: 'General Aptitude', topic: 'Spatial Aptitude', subtopic: 'Rotation', description: 'Rotation', order_num: 219 },
  { subject: 'General Aptitude', topic: 'Spatial Aptitude', subtopic: 'Scaling', description: 'Scaling', order_num: 220 },
  { subject: 'General Aptitude', topic: 'Spatial Aptitude', subtopic: 'Mirroring', description: 'Mirroring', order_num: 221 },
  { subject: 'General Aptitude', topic: 'Spatial Aptitude', subtopic: 'Assembling and grouping', description: 'Assembling shapes', order_num: 222 },
  { subject: 'General Aptitude', topic: 'Spatial Aptitude', subtopic: 'Paper folding and cutting', description: 'Paper folding', order_num: 223 },
  { subject: 'General Aptitude', topic: 'Spatial Aptitude', subtopic: 'Patterns in 2D and 3D', description: 'Patterns', order_num: 224 }
];

s.from('learning_topics').insert(rows).then(({error}) => {
  if (error) console.error(error);
  else console.log('Successfully inserted General Aptitude topics');
});
