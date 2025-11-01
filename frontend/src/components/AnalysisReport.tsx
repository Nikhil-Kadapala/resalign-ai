import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Briefcase, 
  GraduationCap,
  Target,
  ExternalLink,
  Clock,
  Sparkles,
  FileText,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { AnalysisResult, LearningResource } from '@/types/analysis';

interface AnalysisReportProps {
  results: AnalysisResult;
}

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
    },
  },
};

const recommendationCardVariants: Variants = {
  rest: { x: 0 },
  hover: { x: 8 },
};

// Helper function to get fit classification styling
const getFitClassificationStyle = (classification: string) => {
  switch (classification) {
    case 'GOOD_FIT':
      return {
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: CheckCircle2,
        label: 'Great Match',
        gradient: 'from-emerald-500 to-teal-500',
        lightBg: 'from-emerald-100 to-teal-100',
      };
    case 'PARTIAL_FIT':
      return {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: AlertCircle,
        label: 'Partial Match',
        gradient: 'from-amber-500 to-orange-500',
        lightBg: 'from-amber-100 to-orange-100',
      };
    case 'NOT_FIT':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: XCircle,
        label: 'Not a Match',
        gradient: 'from-red-500 to-rose-500',
        lightBg: 'from-red-100 to-rose-100',
      };
    default:
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: AlertCircle,
        label: 'Unknown',
        gradient: 'from-gray-500 to-slate-500',
        lightBg: 'from-gray-100 to-slate-100',
      };
  }
};

// Helper to get score color
const getScoreColor = (score: number | undefined): string => {
  if (!score) return 'text-gray-600';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

// Helper to get progress bar color
const getProgressBarColor = (score: number | undefined): string => {
  if (!score) return 'bg-gray-500';
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

// Category icons
const categoryIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  skills_match: Target as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  experience_alignment: Briefcase as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  education_and_certifications: GraduationCap as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  achievements_and_outcomes: Award as React.ComponentType<React.SVGProps<SVGSVGElement>>,
  soft_skills_and_culture: Sparkles as React.ComponentType<React.SVGProps<SVGSVGElement>>,
};

// Format category name
const formatCategoryName = (category: string): string => {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Resource type badge colors
const getResourceTypeBadgeColor = (type: string): string => {
  switch (type) {
    case 'course':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'certification':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    case 'tutorial':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'book':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    case 'video':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

// Get resource type icon
const getResourceTypeIcon = (type: string): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
  switch (type) {
    case 'course':
      return BookOpen;
    case 'certification':
      return Award;
    case 'tutorial':
      return Lightbulb;
    case 'book':
      return FileText;
    case 'video':
      return Sparkles;
    default:
      return BookOpen;
  }
};

export const AnalysisReport = ({ results }: AnalysisReportProps) => {
  if (!results) {
    console.error('AnalysisReport: results prop is undefined or null')
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold">Error: Analysis results not available</p>
      </div>
    )
  }

  console.log('AnalysisReport rendering with:', {
    has_fit_classification: !!results.fit_classification,
    has_overall_score: !!results.overall_score,
    has_recommendations: Array.isArray(results.recommendations),
    has_learning_resources: Array.isArray(results.learning_resources),
  })

  const fitStyle = getFitClassificationStyle(results.fit_classification);
  const FitIcon = fitStyle.icon;

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Overall Score Card - Hero Section */}
      <motion.div variants={itemVariants}>
        <Card className={`border-2 ${fitStyle.borderColor} overflow-hidden shadow-lg hover:shadow-xl transition-shadow`}>
          <div className={`h-3 bg-gradient-to-r ${fitStyle.gradient}`} />
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Score Display */}
              <div className="text-center md:text-left">
                <motion.div 
                  className="inline-flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FitIcon className={`h-8 w-8 ${fitStyle.color}`} />
                  </motion.div>
                  <Badge className={`${fitStyle.bgColor} ${fitStyle.color} text-base px-4 py-2 font-semibold`}>
                    {fitStyle.label}
                  </Badge>
                </motion.div>
                
                <motion.div
                  className={`text-7xl font-bold ${fitStyle.color} mb-3 font-mono`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6, type: 'spring', stiffness: 100 }}
                >
                  {Math.round(results.overall_score)}
                  <span className="text-4xl ml-2">%</span>
                </motion.div>
                
                <motion.p 
                  className="text-lg font-semibold text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Overall Match Score
                </motion.p>
              </div>

              {/* Fit Rationale */}
              <motion.div 
                className={`bg-gradient-to-br ${fitStyle.lightBg} rounded-xl p-6 border ${fitStyle.borderColor}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className={`flex items-center gap-2 mb-4 ${fitStyle.color}`}>
                  <TrendingUp className="h-6 w-6" />
                  <h3 className="font-bold text-lg">Assessment Summary</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm line-clamp-6">
                  {results.fit_rationale}
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                <Target className="h-6 w-6 text-blue-600" />
              </motion.div>
              Category Breakdown
            </CardTitle>
            <CardDescription>
              Detailed analysis across key evaluation areas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {Object.entries(results.category_scores).map(([category, score], idx) => {
              const Icon = categoryIcons[category] || Target;
              return (
                <motion.div
                  key={category}
                  className="space-y-3"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 6 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                      >
                        {<Icon className="h-5 w-5 text-gray-600" />}
                      </motion.div>
                      <span className="font-semibold text-gray-800">{formatCategoryName(category)}</span>
                    </div>
                    <motion.span 
                      className={`text-2xl font-bold ${getScoreColor(score)} font-mono`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                    >
                      {Math.round(score || 0)}%
                    </motion.span>
                  </div>
                  
                  {/* Progress Bar with animated fill */}
                  <motion.div 
                    className="relative h-3 bg-gray-100 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <motion.div
                      className={`h-full ${getProgressBarColor(score)} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${score || 0}%` }}
                      transition={{ delay: 0.6 + idx * 0.1, duration: 0.8 }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs for Recommendations and Resources */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 shadow-sm">
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning Path
            </TabsTrigger>
          </TabsList>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-purple-600" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  Actionable suggestions to strengthen your application and improve your match
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {results.recommendations && results.recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {results.recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial="rest"
                        whileHover="hover"
                        variants={recommendationCardVariants}
                        className="group"
                      >
                        <motion.div
                          variants={cardHoverVariants}
                          className="p-5 rounded-xl bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex gap-4">
                            <motion.div 
                              className="flex-shrink-0 mt-1"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                            >
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                {index + 1}
                              </div>
                            </motion.div>
                            <motion.div 
                              className="flex-1"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <p className="text-gray-800 leading-relaxed font-medium">
                                {recommendation}
                              </p>
                            </motion.div>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-gray-500">No specific recommendations available.</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Resources Tab */}
          <TabsContent value="resources" className="mt-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  Curated Learning Resources
                </CardTitle>
                <CardDescription>
                  Handpicked courses, certifications, and tutorials to close skill gaps and accelerate your growth
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {results.learning_resources && results.learning_resources.length > 0 ? (
                  <div className="grid gap-5">
                    {results.learning_resources.map((resource: LearningResource, index: number) => {
                      const ResourceIcon = getResourceTypeIcon(resource.resource_type);
                      return (
                        <motion.a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: index * 0.1 }}
                          whileHover="hover"
                          className="block group"
                        >
                          <motion.div
                            variants={cardHoverVariants}
                            className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all bg-white relative overflow-hidden"
                          >
                            {/* Animated background gradient on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            
                            <div className="flex items-start justify-between gap-4 relative z-10">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                                  >
                                    {<ResourceIcon className="h-5 w-5 text-blue-600" />}
                                  </motion.div>
                                  <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-lg">
                                    {resource.title}
                                  </h3>
                                  <Badge className={`${getResourceTypeBadgeColor(resource.resource_type)} font-semibold`}>
                                    {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {resource.description}
                                </p>
                                <div className="flex items-center gap-5 text-xs font-medium text-gray-500 flex-wrap pt-2">
                                  {resource.estimated_hours > 0 && (
                                    <span className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-lg">
                                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                                      <span className="text-amber-700">{resource.estimated_hours} hours</span>
                                    </span>
                                  )}
                                  <span className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-lg">
                                    <Award className="h-3.5 w-3.5 text-purple-600" />
                                    <span className="text-purple-700">{formatCategoryName(resource.category)}</span>
                                  </span>
                                </div>
                              </div>
                              <motion.div 
                                className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0"
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                              >
                                <ExternalLink className="h-6 w-6" />
                              </motion.div>
                            </div>
                          </motion.div>
                        </motion.a>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No learning resources available.</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

