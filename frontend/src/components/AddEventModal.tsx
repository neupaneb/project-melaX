import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Calendar, Clock, MapPin, DollarSign, Image, User, Star, Plus, Trash2, Upload, Tag, Percent } from 'lucide-react';
import { useEventManagement, CreateEventData } from '../contexts/EventManagementContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { TicketCategory, Voucher } from '../data/mockEvents';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose }) => {
  const { createEvent, createVoucher, isLoading } = useEventManagement();
  const { user } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [vouchers, setVouchers] = useState<Partial<Voucher>[]>([]);
  const [showVoucherSection, setShowVoucherSection] = useState(false);

  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    city: 'New York',
    country: 'United States',
    ticketCategories: [
      { name: 'General Admission', price: 0, currency: 'USD', description: '', available: 100 }
    ],
    category: 'General',
    imageUrl: '',
    organizer: user?.name || '',
    featured: false
  });

  const categories = [
    'General',
    'Concerts',
    'Sports',
    'Workshops',
    'Tech',
    'Festivals',
    'Cultural',
    'Business',
    'Education',
    'Entertainment'
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Portugal', 'Ireland', 'Greece', 'Turkey', 'Russia', 'Japan', 'South Korea', 'China', 'India', 'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam', 'Australia', 'New Zealand', 'Brazil', 'Argentina', 'Chile', 'Mexico', 'Colombia', 'Peru', 'Uruguay', 'South Africa', 'Egypt', 'Morocco', 'Kenya', 'Nigeria', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda', 'Senegal', 'Ivory Coast', 'Cameroon', 'Angola', 'Mozambique', 'Madagascar', 'Mauritius', 'Seychelles', 'Nepal', 'Bangladesh', 'Pakistan', 'Sri Lanka', 'Maldives', 'Afghanistan', 'Bhutan', 'Myanmar', 'Cambodia', 'Laos', 'Mongolia', 'Taiwan', 'Hong Kong', 'Macau', 'Israel', 'Jordan', 'Lebanon', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Iraq', 'Iran', 'Syria', 'Yemen'
  ];

  const cities = [
    // United States
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans',
    // Canada
    'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'Sherbrooke', 'Kelowna', 'Barrie',
    // United Kingdom
    'London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Leicester', 'Coventry', 'Cardiff', 'Belfast', 'Nottingham', 'Hull', 'Newcastle', 'Stoke-on-Trent', 'Southampton', 'Derby', 'Portsmouth',
    // Germany
    'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hannover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster',
    // France
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
    // Italy
    'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Taranto', 'Brescia', 'Prato', 'Parma', 'Modena',
    // Spain
    'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'A Coruña', 'Vitoria', 'Granada', 'Elche',
    // Japan
    'Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama', 'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai', 'Niigata', 'Hamamatsu', 'Okayama', 'Kumamoto', 'Shizuoka',
    // China
    'Shanghai', 'Beijing', 'Chongqing', 'Tianjin', 'Guangzhou', 'Shenzhen', 'Wuhan', 'Dongguan', 'Chengdu', 'Nanjing', 'Xi\'an', 'Hangzhou', 'Foshan', 'Shenyang', 'Harbin', 'Qingdao', 'Suzhou', 'Dalian', 'Zhengzhou', 'Jinan',
    // India
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
    // Australia
    'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston',
    // Brazil
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina',
    // Nepal
    'Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar', 'Birgunj', 'Dharan', 'Butwal', 'Hetauda', 'Nepalgunj', 'Birendranagar', 'Dhulikhel', 'Janakpur', 'Tansen', 'Dhangadhi', 'Mahendranagar', 'Bhimdatta', 'Ghorahi', 'Tulsipur', 'Kalaiya'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨' },
    { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: '.ރ' },
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
    { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
    { code: 'COP', name: 'Colombian Peso', symbol: '$' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
    { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr' },
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب' },
    { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج' },
    { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د' },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
    { code: 'BWP', name: 'Botswana Pula', symbol: 'P' },
    { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$' },
    { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L' },
    { code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
    { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨' },
    { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨' },
    { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
    { code: 'KMF', name: 'Comorian Franc', symbol: 'CF' },
    { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj' },
    { code: 'SOS', name: 'Somali Shilling', symbol: 'S' },
    { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk' },
    { code: 'STN', name: 'São Tomé Dobra', symbol: 'Db' },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
    { code: 'CDF', name: 'Congolese Franc', symbol: 'FC' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
    { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu' },
    { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
    { code: 'GNF', name: 'Guinean Franc', symbol: 'FG' },
    { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$' },
    { code: 'SLL', name: 'Sierra Leonean Leone', symbol: 'Le' },
    { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$' },
    { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
    { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },
    { code: 'XPF', name: 'CFP Franc', symbol: '₣' }
  ];

  const handleInputChange = (field: keyof CreateEventData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTicketCategory = () => {
    setFormData(prev => ({
      ...prev,
      ticketCategories: [
        ...prev.ticketCategories,
        { name: '', price: 0, currency: 'USD', description: '', available: 100 }
      ]
    }));
  };

  const removeTicketCategory = (index: number) => {
    if (formData.ticketCategories.length > 1) {
      setFormData(prev => ({
        ...prev,
        ticketCategories: prev.ticketCategories.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTicketCategory = (index: number, field: keyof TicketCategory, value: any) => {
    setFormData(prev => ({
      ...prev,
      ticketCategories: prev.ticketCategories.map((cat, i) => 
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  const addVoucher = () => {
    setVouchers(prev => [
      ...prev,
      {
        code: '',
        discountPercentage: 10,
        description: '',
        maxUses: 100,
        maxUsesPerUser: 1,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        minOrderAmount: 0,
        maxDiscountAmount: null
      }
    ]);
  };

  const removeVoucher = (index: number) => {
    setVouchers(prev => prev.filter((_, i) => i !== index));
  };

  const updateVoucher = (index: number, field: keyof Voucher, value: any) => {
    setVouchers(prev => prev.map((voucher, i) => 
      i === index ? { ...voucher, [field]: value } : voucher
    ));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Event description is required');
      return false;
    }
    if (!formData.date) {
      setError('Event date is required');
      return false;
    }
    if (!formData.time) {
      setError('Event time is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Event location is required');
      return false;
    }
    if (formData.ticketCategories.length === 0) {
      setError('At least one ticket category is required');
      return false;
    }
    for (const category of formData.ticketCategories) {
      if (!category.name.trim()) {
        setError('All ticket categories must have a name');
        return false;
      }
      if (category.price < 0) {
        setError('Ticket prices cannot be negative');
        return false;
      }
      if (category.available <= 0) {
        setError('Available tickets must be greater than 0');
        return false;
      }
    }
    if (!formData.imageUrl.trim()) {
      setError('Event image URL is required');
      return false;
    }
    if (!formData.organizer.trim()) {
      setError('Organizer name is required');
      return false;
    }

    // Validate date is not in the past
    const eventDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      setError('Event date cannot be in the past');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const eventId = await createEvent(formData);
      if (eventId) {
        // Create vouchers if any
        if (vouchers.length > 0) {
          for (const voucher of vouchers) {
            if (voucher.code && voucher.discountPercentage) {
              await createVoucher(eventId, voucher);
            }
          }
        }
        
        setSuccess('Event created successfully!');
        toast.success('Event created successfully!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          city: 'New York',
          country: 'United States',
          ticketCategories: [
            { name: 'General Admission', price: 0, currency: 'USD', description: '', available: 100 }
          ],
          category: 'General',
          imageUrl: '',
          organizer: user?.name || '',
          featured: false
        });
        setImagePreview('');
        setVouchers([]);
        setShowVoucherSection(false);

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        setError('Failed to create event. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while creating the event');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setError('');
      setSuccess('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center">
            <Calendar className="w-6 h-6 mr-2 text-red-600" />
            Create New Event
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <div className="relative">
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Event Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your event in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Date & Time</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Venue/Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter venue name or address"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ticket Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Ticket Categories</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTicketCategory}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </Button>
            </div>
            
            {formData.ticketCategories.map((category, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">Category {index + 1}</h4>
                  {formData.ticketCategories.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTicketCategory(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`categoryName-${index}`}>Category Name *</Label>
                    <Input
                      id={`categoryName-${index}`}
                      placeholder="e.g., General Admission, VIP, Premium"
                      value={category.name}
                      onChange={(e) => updateTicketCategory(index, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`categoryPrice-${index}`}>Price *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id={`categoryPrice-${index}`}
                        type="number"
                        placeholder="0"
                        value={category.price}
                        onChange={(e) => updateTicketCategory(index, 'price', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`categoryCurrency-${index}`}>Currency *</Label>
                    <Select 
                      value={category.currency} 
                      onValueChange={(value) => updateTicketCategory(index, 'currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`categoryAvailable-${index}`}>Available Tickets *</Label>
                    <Input
                      id={`categoryAvailable-${index}`}
                      type="number"
                      placeholder="100"
                      value={category.available}
                      onChange={(e) => updateTicketCategory(index, 'available', parseInt(e.target.value) || 0)}
                      min="1"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`categoryDescription-${index}`}>Description (Optional)</Label>
                  <Textarea
                    id={`categoryDescription-${index}`}
                    placeholder="Describe what's included in this ticket category..."
                    value={category.description}
                    onChange={(e) => updateTicketCategory(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="imageUpload">Event Image *</Label>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview && (
                    <span className="text-sm text-green-600 dark:text-green-400">✓ Image uploaded</span>
                  )}
                </div>
                
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                {!imagePreview && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No image selected</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Click "Upload Image" to select a photo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="organizer"
                  type="text"
                  placeholder="Enter organizer name"
                  value={formData.organizer}
                  onChange={(e) => handleInputChange('organizer', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>


            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleInputChange('featured', checked)}
              />
              <Label htmlFor="featured" className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                Featured Event
              </Label>
            </div>
          </div>

          {/* Voucher Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Promo Codes (Optional)</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVoucherSection(!showVoucherSection)}
                className="flex items-center space-x-2"
              >
                <Tag className="w-4 h-4" />
                <span>{showVoucherSection ? 'Hide' : 'Add'} Promo Codes</span>
              </Button>
            </div>
            
            {showVoucherSection && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create discount codes for your event
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addVoucher}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Code</span>
                  </Button>
                </div>
                
                {vouchers.map((voucher, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white">Promo Code {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVoucher(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`voucherCode-${index}`}>Promo Code *</Label>
                        <Input
                          id={`voucherCode-${index}`}
                          placeholder="e.g., SAVE20, WELCOME10"
                          value={voucher.code}
                          onChange={(e) => updateVoucher(index, 'code', e.target.value.toUpperCase())}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`voucherDiscount-${index}`}>Discount % *</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id={`voucherDiscount-${index}`}
                            type="number"
                            placeholder="10"
                            value={voucher.discountPercentage}
                            onChange={(e) => updateVoucher(index, 'discountPercentage', parseInt(e.target.value) || 0)}
                            min="1"
                            max="100"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`voucherMaxUses-${index}`}>Max Total Uses *</Label>
                        <Input
                          id={`voucherMaxUses-${index}`}
                          type="number"
                          placeholder="100"
                          value={voucher.maxUses}
                          onChange={(e) => updateVoucher(index, 'maxUses', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`voucherMaxUsesPerUser-${index}`}>Max Uses Per User *</Label>
                        <Input
                          id={`voucherMaxUsesPerUser-${index}`}
                          type="number"
                          placeholder="1"
                          value={voucher.maxUsesPerUser}
                          onChange={(e) => updateVoucher(index, 'maxUsesPerUser', parseInt(e.target.value) || 1)}
                          min="1"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`voucherMinOrder-${index}`}>Min Order Amount</Label>
                        <Input
                          id={`voucherMinOrder-${index}`}
                          type="number"
                          placeholder="0"
                          value={voucher.minOrderAmount}
                          onChange={(e) => updateVoucher(index, 'minOrderAmount', parseFloat(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`voucherValidFrom-${index}`}>Valid From *</Label>
                        <Input
                          id={`voucherValidFrom-${index}`}
                          type="date"
                          value={voucher.validFrom}
                          onChange={(e) => updateVoucher(index, 'validFrom', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`voucherValidUntil-${index}`}>Valid Until *</Label>
                        <Input
                          id={`voucherValidUntil-${index}`}
                          type="date"
                          value={voucher.validUntil}
                          onChange={(e) => updateVoucher(index, 'validUntil', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`voucherDescription-${index}`}>Description (Optional)</Label>
                      <Textarea
                        id={`voucherDescription-${index}`}
                        placeholder="Describe this promo code..."
                        value={voucher.description}
                        onChange={(e) => updateVoucher(index, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                
                {vouchers.length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No promo codes added yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Click "Add Code" to create discount codes for your event</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Event...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
