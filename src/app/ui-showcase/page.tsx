"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Import all UI components
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/components/ui/menubar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function UIShowcase() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [sliderValue, setSliderValue] = useState([50]);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HROne UI Components Showcase
            </h1>
            <p className="text-lg text-muted-foreground">
              Complete visual demonstration of all available UI components
            </p>
          </div>

          {/* Navigation */}
          <Menubar className="w-full">
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  New Project
                  <MenubarShortcut>⌘N</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  Open
                  <MenubarShortcut>⌘O</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Quit</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Undo</MenubarItem>
                <MenubarItem>Redo</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Cut</MenubarItem>
                <MenubarItem>Copy</MenubarItem>
                <MenubarItem>Paste</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>UI Showcase</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Basic Components */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Components</CardTitle>
              <CardDescription>Fundamental UI elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Badge>Default Badge</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>

              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">john@example.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Components */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Input and form elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter password" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Type your message here..." />
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={selectedValue} onValueChange={setSelectedValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>OTP Input</Label>
                <InputOTP maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-2">
                <Label>Slider Value: {sliderValue[0]}</Label>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={isSwitchOn}
                  onCheckedChange={(checked) => setIsSwitchOn(checked as boolean)}
                />
                <Label>Enable notifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => setIsChecked(checked as boolean)}
                />
                <Label>I agree to the terms</Label>
              </div>

              <div className="space-y-2">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="option1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="option1" />
                    <Label htmlFor="option1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="option2" />
                    <Label htmlFor="option2">Option 2</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Components */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Components</CardTitle>
              <CardDescription>Modals, dropdowns, and interactive elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        This is a dialog component with some content.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p>Dialog content goes here...</p>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline">Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Sheet Title</SheetTitle>
                      <SheetDescription>
                        This is a sheet component from the side.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <p>Sheet content goes here...</p>
                    </div>
                  </SheetContent>
                </Sheet>

                <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                  <DrawerTrigger asChild>
                    <Button variant="outline">Open Drawer</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Drawer Title</DrawerTitle>
                      <DrawerDescription>
                        This is a drawer component from the bottom.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="py-4">
                      <p>Drawer content goes here...</p>
                    </div>
                    <DrawerFooter>
                      <Button onClick={() => setIsDrawerOpen(false)}>Close</Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>

                <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Alert Dialog</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => setIsAlertDialogOpen(false)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open Popover</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p>This is a popover component with some content.</p>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-wrap gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Dropdown Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <Button variant="outline">Right Click Me</Button>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>More Options</ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        <ContextMenuItem>Option 1</ContextMenuItem>
                        <ContextMenuItem>Option 2</ContextMenuItem>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuSeparator />
                    <ContextMenuItem>Delete</ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="outline">Hover Card</Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p>This content appears when you hover over the trigger.</p>
                  </HoverCardContent>
                </HoverCard>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Tooltip</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a tooltip!</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* Data Display Components */}
          <Card>
            <CardHeader>
              <CardTitle>Data Display Components</CardTitle>
              <CardDescription>Tables, cards, and data visualization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">John Doe</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Jane Smith</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Inactive</Badge>
                    </TableCell>
                    <TableCell>User</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231</div>
                    <p className="text-xs text-muted-foreground">+8% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23.5%</div>
                    <p className="text-xs text-muted-foreground">+2% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Navigation & Layout Components */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation & Layout</CardTitle>
              <CardDescription>Tabs, accordion, and navigation elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="space-y-4">
                  <p>Account settings content...</p>
                </TabsContent>
                <TabsContent value="password" className="space-y-4">
                  <p>Password settings content...</p>
                </TabsContent>
                <TabsContent value="notifications" className="space-y-4">
                  <p>Notification settings content...</p>
                </TabsContent>
              </Tabs>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is HROne?</AccordionTrigger>
                  <AccordionContent>
                    HROne is a modern HR management system built with Next.js and TypeScript.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>What features does it include?</AccordionTrigger>
                  <AccordionContent>
                    It includes employee management, attendance tracking, leave management, payroll, and more.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Is it production ready?</AccordionTrigger>
                  <AccordionContent>
                    Yes! It's built with enterprise-grade architecture and is ready for production deployment.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>

          {/* Advanced Components */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Components</CardTitle>
              <CardDescription>Calendar, carousel, and complex components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Calendar</h3>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Progress & Skeleton</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Upload Progress</span>
                        <span className="text-sm text-muted-foreground">75%</span>
                      </div>
                      <Progress value={75} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Carousel</h3>
                <Carousel className="w-full max-w-xs mx-auto">
                  <CarouselContent>
                    <CarouselItem>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-3xl font-semibold">1</span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-3xl font-semibold">2</span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-3xl font-semibold">3</span>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Toggle Group</h3>
                <ToggleGroup type="single" defaultValue="center">
                  <ToggleGroupItem value="left">Left</ToggleGroupItem>
                  <ToggleGroupItem value="center">Center</ToggleGroupItem>
                  <ToggleGroupItem value="right">Right</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Resizable Panels</h3>
                <div className="flex w-full max-w-lg rounded-lg border">
                  <div className="w-1/4 flex items-center justify-center p-6 border-r">
                    <span className="font-semibold">Left Panel</span>
                  </div>
                  <div className="w-3/4 flex items-center justify-center p-6">
                    <span className="font-semibold">Right Panel</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Utility Components */}
          <Card>
            <CardHeader>
              <CardTitle>Utility Components</CardTitle>
              <CardDescription>Separators, alerts, and utility elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    This is an informational alert message.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    This is an error alert message.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-4">
                <Separator />
                <p>Content after separator</p>
                <Separator orientation="vertical" className="h-4" />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Scroll Area</h3>
                <ScrollArea className="h-32 w-full rounded-md border p-4">
                  <div className="space-y-2">
                    <p>This is a scrollable area component.</p>
                    <p>You can add lots of content here...</p>
                    <p>And it will become scrollable when needed.</p>
                    <p>More content...</p>
                    <p>Even more content...</p>
                    <p>Last bit of content...</p>
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Command Component */}
          <Card>
            <CardHeader>
              <CardTitle>Command Component</CardTitle>
              <CardDescription>Command palette for quick actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem>
                      <span>Calendar</span>
                    </CommandItem>
                    <CommandItem>
                      <span>Search Emoji</span>
                    </CommandItem>
                    <CommandItem>
                      <span>Calculator</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8 border-t">
            <p className="text-muted-foreground">
              HROne UI Components Showcase - Built with Next.js, TypeScript, and TailwindCSS
            </p>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
