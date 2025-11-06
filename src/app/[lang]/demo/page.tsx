import Link from "next/link";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { FileText, List, ExternalLink } from "lucide-react";

interface DemoPageProps {
 params: Promise<{
  lang: string;
 }>;
}

/**
 * Demo Hub - Navigate to All Demo Pages
 *
 * This page provides access to all demo routes that use mock data
 * for comparison with real API implementations.
 */
export default async function DemoPage({ params }: DemoPageProps) {
 const { lang } = await params;

 const demoRoutes = [
  {
   title: 'Task Detail Pages',
   description: 'View individual task details with mock data',
   icon: FileText,
   routes: [
    { label: 'Task #1 - Dog Walking', path: `/demo/tasks/1` },
    { label: 'Task #2 - Balcony Repair', path: `/demo/tasks/2` },
    { label: 'Task #3 - Apartment Cleaning', path: `/demo/tasks/3` },
   ]
  },
  {
   title: 'Task Management Pages (Future Integration)',
   description: 'UI showcasing all task statuses and states - to be integrated with API',
   icon: List,
   routes: [
    { label: 'Posted Tasks - All UI states (open, in progress, completed, etc.)', path: `/tasks/posted`, note: 'TODO: Currently uses empty state, mocks removed' },
    { label: 'My Applications - Application statuses', path: `/tasks/applications`, note: 'TODO: Currently uses empty state, mocks removed' },
    { label: 'My Work - Active work and confirmations', path: `/tasks/work`, note: 'TODO: Currently uses empty state, mocks removed' },
   ]
  },
 ];

 return (
  <div className="min-h-screen bg-gray-50 py-12">
   <div className="container mx-auto px-4 max-w-4xl">
    {/* Header */}
    <div className="text-center mb-12">
     <h1 className="text-4xl font-bold text-gray-900 mb-4">
      📋 Demo Hub
     </h1>
     <p className="text-lg text-gray-600">
      Navigate to demo pages with mock data for development and testing
     </p>
     <div className="mt-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 inline-block">
      <p className="text-yellow-800 text-sm">
       <strong>Note:</strong> Demo pages use static mock data and don't connect to the database.
       Compare with real routes to verify API integration.
      </p>
     </div>
    </div>

    {/* Demo Routes */}
    <div className="space-y-6">
     {demoRoutes.map((section, idx) => (
      <Card key={idx} className="shadow-lg">
       <CardHeader className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
         <section.icon className="w-6 h-6 text-primary-600" />
         <div>
          <h2 className="text-xl font-semibold text-gray-900">
           {section.title}
          </h2>
          <p className="text-sm text-gray-600">
           {section.description}
          </p>
         </div>
        </div>
       </CardHeader>
       <CardBody>
        <div className="space-y-2">
         {section.routes.map((route: any, routeIdx) => (
          <div key={routeIdx}>
           <Link
            href={`/${lang}${route.path}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors group"
           >
            <span className="text-gray-900 group-hover:text-primary-600 font-medium">
             {route.label}
            </span>
            <ExternalLink
             className={`w-4 h-4 ${route.external ? 'text-blue-600' : 'text-gray-400'} group-hover:text-primary-600`}
            />
           </Link>
           {route.note && (
            <p className="text-xs text-gray-500 italic px-3 pb-2">
             {route.note}
            </p>
           )}
          </div>
         ))}
        </div>
       </CardBody>
      </Card>
     ))}
    </div>

    {/* Footer */}
    <div className="mt-12 text-center">
     <Link
      href={`/${lang}`}
      className="text-primary-600 hover:text-primary-700 font-medium"
     >
      ← Back to Home
     </Link>
    </div>
   </div>
  </div>
 );
}
