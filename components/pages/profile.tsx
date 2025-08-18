import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Star, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Settings,
  Briefcase
} from "lucide-react";
import { insertUserSchema, TASK_CATEGORIES } from "@/shared/schema";
import { z } from "zod";

const profileUpdateSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
  phoneNumber: true,
  city: true,
  country: true,
  userType: true,
  serviceCategories: true,
  bio: true,
  vatNumber: true,
});

type ProfileFormData = z.infer<typeof profileUpdateSchema>;

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: [`/api/users/${user?.id}/stats`],
    enabled: !!user?.id,
  });

  // Fetch user reviews
  const { data: userReviews = [] } = useQuery({
    queryKey: [`/api/users/${user?.id}/reviews`],
    enabled: !!user?.id,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      city: user?.city || "",
      country: user?.country || "Bulgaria",
      userType: user?.userType || "customer",
      serviceCategories: user?.serviceCategories || [],
      bio: user?.bio || "",
      vatNumber: user?.vatNumber || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        city: user.city || "",
        country: user.country || "Bulgaria",
        userType: user.userType || "customer",
        serviceCategories: user.serviceCategories || [],
        bio: user.bio || "",
        vatNumber: user.vatNumber || "",
      });
    }
  }, [user, form]);

  const watchedUserType = form.watch("userType");
  const watchedServiceCategories = form.watch("serviceCategories");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PATCH", "/api/auth/user", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Успех",
        description: "Профилът беше обновен успешно!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Грешка",
        description: "Неуспешно обновяване на профил.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isProfessional = watchedUserType === "professional";
  const isProfileComplete = user?.city && user?.phoneNumber && (isProfessional ? user?.serviceCategories?.length : true);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Моят профил
          </h1>
          <p className="text-gray-600">
            Управлявайте профила и настройките си
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Overview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback className="text-xl">
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-gray-600 text-sm">{user?.email}</p>
                </div>

                {/* Profile Completion */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Завършеност на профила</span>
                    <span>{isProfileComplete ? "100%" : "60%"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${isProfileComplete ? "bg-green-500" : "bg-yellow-500"}`}
                      style={{ width: isProfileComplete ? "100%" : "60%" }}
                    ></div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Тип профил</span>
                    <Badge variant="outline">
                      {user?.userType === "professional" ? "Специалист" : "Клиент"}
                    </Badge>
                  </div>
                  {user?.userType === "professional" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Средна оценка</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">
                            {user?.averageRating ? Number(user.averageRating).toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Завършени задачи</span>
                        <span className="text-sm font-medium">
                          {userStats?.completedTasks || 0}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Верификации</span>
                    <div className="flex space-x-1">
                      {user?.isPhoneVerified && (
                        <Badge className="bg-green-100 text-green-800">Телефон</Badge>
                      )}
                      {user?.isVatVerified && (
                        <Badge className="bg-blue-100 text-blue-800">ДДС</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Бързи действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="mr-2" size={16} />
                  Моите задачи
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Star className="mr-2" size={16} />
                  Отзиви за мен
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="mr-2" size={16} />
                  Настройки
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Профил</TabsTrigger>
                <TabsTrigger value="verification">Верификация</TabsTrigger>
                <TabsTrigger value="reviews">Отзиви</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Основна информация</CardTitle>
                        <CardDescription>
                          Обновете основните данни за профила си
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Име *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Иван" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Фамилия *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Петров" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Телефонен номер *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <Input placeholder="+359 88 123 4567" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Град *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                    <Input placeholder="София" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Държава</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Bulgaria">България</SelectItem>
                                  <SelectItem value="Romania">Румъния</SelectItem>
                                  <SelectItem value="Serbia">Сърбия</SelectItem>
                                  <SelectItem value="North Macedonia">Северна Македония</SelectItem>
                                  <SelectItem value="Greece">Гърция</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* User Type */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Тип профил</CardTitle>
                        <CardDescription>
                          Изберете дали сте клиент или специалист
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="userType"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="customer">Клиент - търся услуги</SelectItem>
                                  <SelectItem value="professional">Специалист - предлагам услуги</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Professional Settings */}
                    {isProfessional && (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle>Професионални услуги</CardTitle>
                            <CardDescription>
                              Изберете категориите услуги, които предлагате
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FormField
                              control={form.control}
                              name="serviceCategories"
                              render={() => (
                                <FormItem>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(TASK_CATEGORIES).map(([key, name]) => (
                                      <FormField
                                        key={key}
                                        control={form.control}
                                        name="serviceCategories"
                                        render={({ field }) => {
                                          return (
                                            <FormItem
                                              key={key}
                                              className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value?.includes(key)}
                                                  onCheckedChange={(checked) => {
                                                    return checked
                                                      ? field.onChange([...field.value, key])
                                                      : field.onChange(
                                                          field.value?.filter(
                                                            (value) => value !== key
                                                          )
                                                        );
                                                  }}
                                                />
                                              </FormControl>
                                              <FormLabel className="font-normal">
                                                {name}
                                              </FormLabel>
                                            </FormItem>
                                          );
                                        }}
                                      />
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="bio"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Описание на услугите</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Опишете опита си, специализациите и подхода към работа..."
                                      className="min-h-[100px]"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Това описание ще бъде видимо за потенциални клиенти
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Бизнес информация</CardTitle>
                            <CardDescription>
                              Данни за фирмена регистрация (по избор)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <FormField
                              control={form.control}
                              name="vatNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ДДС/VAT номер</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123456789" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    При попълване ще получите верифицирана значка за повече доверие
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </>
                    )}

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-primary-500 hover:bg-primary-600"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Запазване..." : "Запази промените"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* Verification Tab */}
              <TabsContent value="verification" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Статус на верификациите</CardTitle>
                    <CardDescription>
                      Верифицирайте профила си за повече доверие от клиентите
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Phone Verification */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user?.isPhoneVerified ? "bg-green-100" : "bg-gray-100"
                        }`}>
                          <Phone className={`w-5 h-5 ${
                            user?.isPhoneVerified ? "text-green-600" : "text-gray-400"
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">Телефонна верификация</h4>
                          <p className="text-sm text-gray-600">
                            Потвърдете телефонния си номер чрез SMS
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user?.isPhoneVerified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1" size={12} />
                            Верифициран
                          </Badge>
                        ) : (
                          <Button variant="outline" size="sm">
                            Верифицирай
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* VAT Verification */}
                    {user?.userType === "professional" && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            user?.isVatVerified ? "bg-blue-100" : "bg-gray-100"
                          }`}>
                            <Shield className={`w-5 h-5 ${
                              user?.isVatVerified ? "text-blue-600" : "text-gray-400"
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold">ДДС/Фирмена верификация</h4>
                            <p className="text-sm text-gray-600">
                              Потвърдете фирмената си регистрация
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {user?.isVatVerified ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle className="mr-1" size={12} />
                              Верифициран
                            </Badge>
                          ) : user?.vatNumber ? (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertCircle className="mr-1" size={12} />
                              Чака проверка
                            </Badge>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              Добавете ДДС номер
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex">
                        <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-semibold text-blue-900">Защо да се верифицирам?</h4>
                          <ul className="text-sm text-blue-700 mt-2 space-y-1">
                            <li>• Повече доверие от клиентите</li>
                            <li>• По-висок рейтинг в резултатите</li>
                            <li>• Специална значка в профила</li>
                            <li>• Достъп до премиум функции</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Отзиви за моята работа</CardTitle>
                    <CardDescription>
                      Виж какво казват клиентите за теб
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userReviews.length > 0 ? (
                      <div className="space-y-6">
                        {userReviews.map((review: any) => (
                          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                            <div className="flex items-start space-x-3">
                              <Avatar>
                                <AvatarImage src={review.reviewer?.profileImageUrl} />
                                <AvatarFallback>
                                  {review.reviewer?.firstName?.[0] || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h5 className="font-semibold">
                                      {review.reviewer?.firstName} {review.reviewer?.lastName}
                                    </h5>
                                    <div className="flex items-center space-x-4">
                                      <div className="flex items-center space-x-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="text-sm font-medium">{review.overallRating}/5</span>
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString("bg-BG")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {review.writtenReview && (
                                  <p className="text-gray-700 mb-3">{review.writtenReview}</p>
                                )}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-gray-500">Качество:</span>
                                    <span className="font-medium">{review.qualityRating}/5</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-gray-500">Срокове:</span>
                                    <span className="font-medium">{review.timelinessRating}/5</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-gray-500">Комуникация:</span>
                                    <span className="font-medium">{review.communicationRating}/5</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Все още няма отзиви
                        </h3>
                        <p className="text-gray-600">
                          Завършете първата си задача, за да получите отзиви от клиенти.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

    </div>
  );
}
