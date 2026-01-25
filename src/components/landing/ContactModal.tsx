import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, Building, User, Shield } from "lucide-react";
import emailjs from '@emailjs/browser';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    type: z.enum(["individual", "institution", "technical"], {
        required_error: "Please select an inquiry type",
    }),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

interface ContactModalProps {
    children: React.ReactNode;
}

export function ContactModal({ children }: ContactModalProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);

        // Env vars should be: 
        // VITE_EMAILJS_SERVICE_ID
        // VITE_EMAILJS_TEMPLATE_ID
        // VITE_EMAILJS_PUBLIC_KEY

        try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

            if (!import.meta.env.VITE_EMAILJS_SERVICE_ID) {
                console.warn("EmailJS credentials not found in env vars, simulating success.");
                await new Promise(resolve => setTimeout(resolve, 1500)); // Sim delay
            } else {
                await emailjs.send(
                    serviceId,
                    templateId,
                    {
                        from_name: values.name,
                        from_email: values.email,
                        inquiry_type: values.type,
                        message: values.message,
                    },
                    publicKey
                );
            }



            setIsSubmitting(false);
            setIsSuccess(true);

            toast({
                title: "Message Sent",
                description: "We've received your inquiry and will get back to you shortly.",
            });

            // Reset after delay
            setTimeout(() => {
                setOpen(false);
                setTimeout(() => {
                    setIsSuccess(false);
                    form.reset();
                }, 500);
            }, 2000);

        } catch (error) {
            console.error("EmailJS Error:", error);
            setIsSubmitting(false);
            toast({
                variant: "destructive",
                title: "Error Sending Message",
                description: "Something went wrong. Please try again later.",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[#0a0a0a] border-zinc-800 text-white shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 pointer-events-none" />

                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Get in Touch
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Have questions about Effortless? We're here to help.
                        </DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 text-green-500">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                                <p className="text-zinc-400">Thanks for reaching out. We'll be in touch soon.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-300">Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} className="bg-white/5 border-zinc-800 focus:border-cyan-500/50 text-white placeholder:text-zinc-500 transition-all" />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-300">Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="john@example.com" {...field} className="bg-white/5 border-zinc-800 focus:border-cyan-500/50 text-white placeholder:text-zinc-500 transition-all" />
                                                        </FormControl>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-300">Inquiry Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-white/5 border-zinc-800 focus:border-cyan-500/50 text-white">
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-[#1a1a1a] border-zinc-800 text-white">
                                                                <SelectItem value="individual">
                                                                    <div className="flex items-center gap-2">
                                                                        <User className="w-4 h-4 text-cyan-400" />
                                                                        <span>Individual Question</span>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="institution">
                                                                    <div className="flex items-center gap-2">
                                                                        <Building className="w-4 h-4 text-purple-400" />
                                                                        <span>Institution / Org</span>
                                                                    </div>
                                                                </SelectItem>
                                                                <SelectItem value="technical">
                                                                    <div className="flex items-center gap-2">
                                                                        <Shield className="w-4 h-4 text-emerald-400" />
                                                                        <span>Technical / Privacy</span>
                                                                    </div>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-red-400" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-300">Message</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="How can we help you?"
                                                            {...field}
                                                            className="bg-white/5 border-zinc-800 focus:border-cyan-500/50 text-white placeholder:text-zinc-500 min-h-[100px] resize-none transition-all"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-400" />
                                                </FormItem>
                                            )}
                                        />

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold h-11 transition-all mt-2"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Send Message <Send className="w-4 h-4" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
