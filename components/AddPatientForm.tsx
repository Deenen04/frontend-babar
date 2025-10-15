'use client';

import { useState } from 'react';
import { Patient } from '@/app/patients/page';

interface AddPatientFormProps {
  onCancel: () => void;
  onSubmit: (patient: Omit<Patient, 'id'> | Patient) => void;
  patient?: Patient;
  isEdit?: boolean;
}

export default function AddPatientForm({ onCancel, onSubmit, patient, isEdit = false }: AddPatientFormProps) {
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    gender: patient?.gender || 'Male',
    dateOfBirth: patient?.dateOfBirth || '',
    ext: patient?.ext || '+351',
    phoneNo: patient?.phoneNo || '',
    email: patient?.email || '',
    address: patient?.address || '',
    insuranceId: patient?.insuranceId || '',
    providerName: patient?.providerName || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const patientData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      dateOfBirth: formData.dateOfBirth,
      ext: formData.ext,
      phoneNo: formData.phoneNo,
      insuranceProvider: formData.providerName || null,
      insuranceId: formData.insuranceId || null,
      email: formData.email,
      address: formData.address,
      gender: formData.gender,
      contactNumber: `${formData.ext} ${formData.phoneNo}`,
      age: 0, // Calculate based on date of birth
    };

    if (isEdit && patient) {
      onSubmit({ ...patientData, id: patient.id });
    } else {
      onSubmit(patientData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? 'Edit Patient' : 'Add New Patient'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
          >
            {isEdit ? 'Save Changes' : 'Add Patient'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="John"
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Doe"
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender*
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth*
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number*
              </label>
              <div className="flex">
                <select
                  value={formData.ext}
                  onChange={(e) => handleInputChange('ext', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-gray-50"
                >
                  <option value="+1">🇺🇸 +1 (US/Canada)</option>
                  <option value="+7">🇷🇺 +7 (Russia/Kazakhstan)</option>
                  <option value="+20">🇪🇬 +20 (Egypt)</option>
                  <option value="+27">🇿🇦 +27 (South Africa)</option>
                  <option value="+30">🇬🇷 +30 (Greece)</option>
                  <option value="+31">🇳🇱 +31 (Netherlands)</option>
                  <option value="+32">🇧🇪 +32 (Belgium)</option>
                  <option value="+33">🇫🇷 +33 (France)</option>
                  <option value="+34">🇪🇸 +34 (Spain)</option>
                  <option value="+36">🇭🇺 +36 (Hungary)</option>
                  <option value="+39">🇮🇹 +39 (Italy)</option>
                  <option value="+40">🇷🇴 +40 (Romania)</option>
                  <option value="+41">🇨🇭 +41 (Switzerland)</option>
                  <option value="+43">🇦🇹 +43 (Austria)</option>
                  <option value="+44">🇬🇧 +44 (UK)</option>
                  <option value="+45">🇩🇰 +45 (Denmark)</option>
                  <option value="+46">🇸🇪 +46 (Sweden)</option>
                  <option value="+47">🇳🇴 +47 (Norway)</option>
                  <option value="+48">🇵🇱 +48 (Poland)</option>
                  <option value="+49">🇩🇪 +49 (Germany)</option>
                  <option value="+51">🇵🇪 +51 (Peru)</option>
                  <option value="+52">🇲🇽 +52 (Mexico)</option>
                  <option value="+53">🇨🇺 +53 (Cuba)</option>
                  <option value="+54">🇦🇷 +54 (Argentina)</option>
                  <option value="+55">🇧🇷 +55 (Brazil)</option>
                  <option value="+56">🇨🇱 +56 (Chile)</option>
                  <option value="+57">🇨🇴 +57 (Colombia)</option>
                  <option value="+58">🇻🇪 +58 (Venezuela)</option>
                  <option value="+60">🇲🇾 +60 (Malaysia)</option>
                  <option value="+61">🇦🇺 +61 (Australia)</option>
                  <option value="+62">🇮🇩 +62 (Indonesia)</option>
                  <option value="+63">🇵🇭 +63 (Philippines)</option>
                  <option value="+64">🇳🇿 +64 (New Zealand)</option>
                  <option value="+65">🇸🇬 +65 (Singapore)</option>
                  <option value="+66">🇹🇭 +66 (Thailand)</option>
                  <option value="+81">🇯🇵 +81 (Japan)</option>
                  <option value="+82">🇰🇷 +82 (South Korea)</option>
                  <option value="+84">🇻🇳 +84 (Vietnam)</option>
                  <option value="+86">🇨🇳 +86 (China)</option>
                  <option value="+90">🇹🇷 +90 (Turkey)</option>
                  <option value="+91">🇮🇳 +91 (India)</option>
                  <option value="+92">🇵🇰 +92 (Pakistan)</option>
                  <option value="+93">🇦🇫 +93 (Afghanistan)</option>
                  <option value="+94">🇱🇰 +94 (Sri Lanka)</option>
                  <option value="+95">🇲🇲 +95 (Myanmar)</option>
                  <option value="+98">🇮🇷 +98 (Iran)</option>
                  <option value="+212">🇲🇦 +212 (Morocco)</option>
                  <option value="+213">🇩🇿 +213 (Algeria)</option>
                  <option value="+216">🇹🇳 +216 (Tunisia)</option>
                  <option value="+218">🇱🇾 +218 (Libya)</option>
                  <option value="+220">🇬🇲 +220 (Gambia)</option>
                  <option value="+221">🇸🇳 +221 (Senegal)</option>
                  <option value="+222">🇲🇷 +222 (Mauritania)</option>
                  <option value="+223">🇲🇱 +223 (Mali)</option>
                  <option value="+224">🇬🇳 +224 (Guinea)</option>
                  <option value="+225">🇨🇮 +225 (Côte d'Ivoire)</option>
                  <option value="+226">🇧🇫 +226 (Burkina Faso)</option>
                  <option value="+227">🇳🇪 +227 (Niger)</option>
                  <option value="+228">🇹🇬 +228 (Togo)</option>
                  <option value="+229">🇧🇯 +229 (Benin)</option>
                  <option value="+230">🇲🇺 +230 (Mauritius)</option>
                  <option value="+231">🇱🇷 +231 (Liberia)</option>
                  <option value="+232">🇸🇱 +232 (Sierra Leone)</option>
                  <option value="+233">🇬🇭 +233 (Ghana)</option>
                  <option value="+234">🇳🇬 +234 (Nigeria)</option>
                  <option value="+235">🇹🇩 +235 (Chad)</option>
                  <option value="+236">🇨🇫 +236 (Central African Republic)</option>
                  <option value="+237">🇨🇲 +237 (Cameroon)</option>
                  <option value="+238">🇨🇻 +238 (Cape Verde)</option>
                  <option value="+239">🇸🇹 +239 (São Tomé and Príncipe)</option>
                  <option value="+240">🇬🇶 +240 (Equatorial Guinea)</option>
                  <option value="+241">🇬🇦 +241 (Gabon)</option>
                  <option value="+242">🇨🇬 +242 (Republic of the Congo)</option>
                  <option value="+243">🇨🇩 +243 (Democratic Republic of the Congo)</option>
                  <option value="+244">🇦🇴 +244 (Angola)</option>
                  <option value="+245">🇬🇼 +245 (Guinea-Bissau)</option>
                  <option value="+246">🇮🇴 +246 (British Indian Ocean Territory)</option>
                  <option value="+248">🇸🇨 +248 (Seychelles)</option>
                  <option value="+249">🇸🇩 +249 (Sudan)</option>
                  <option value="+250">🇷🇼 +250 (Rwanda)</option>
                  <option value="+251">🇪🇹 +251 (Ethiopia)</option>
                  <option value="+252">🇸🇴 +252 (Somalia)</option>
                  <option value="+253">🇩🇯 +253 (Djibouti)</option>
                  <option value="+254">🇰🇪 +254 (Kenya)</option>
                  <option value="+255">🇹🇿 +255 (Tanzania)</option>
                  <option value="+256">🇺🇬 +256 (Uganda)</option>
                  <option value="+257">🇧🇮 +257 (Burundi)</option>
                  <option value="+258">🇲🇿 +258 (Mozambique)</option>
                  <option value="+260">🇿🇲 +260 (Zambia)</option>
                  <option value="+261">🇲🇬 +261 (Madagascar)</option>
                  <option value="+262">🇷🇪 +262 (Réunion)</option>
                  <option value="+263">🇿🇼 +263 (Zimbabwe)</option>
                  <option value="+264">🇳🇦 +264 (Namibia)</option>
                  <option value="+265">🇲🇼 +265 (Malawi)</option>
                  <option value="+266">🇱🇸 +266 (Lesotho)</option>
                  <option value="+267">🇧🇼 +267 (Botswana)</option>
                  <option value="+268">🇸🇿 +268 (Eswatini)</option>
                  <option value="+269">🇰🇲 +269 (Comoros)</option>
                  <option value="+290">🇸🇭 +290 (Saint Helena)</option>
                  <option value="+291">🇪🇷 +291 (Eritrea)</option>
                  <option value="+297">🇦🇼 +297 (Aruba)</option>
                  <option value="+298">🇫🇴 +298 (Faroe Islands)</option>
                  <option value="+299">🇬🇱 +299 (Greenland)</option>
                  <option value="+350">🇬🇮 +350 (Gibraltar)</option>
                  <option value="+351">🇵🇹 +351 (Portugal)</option>
                  <option value="+352">🇱🇺 +352 (Luxembourg)</option>
                  <option value="+353">🇮🇪 +353 (Ireland)</option>
                  <option value="+354">🇮🇸 +354 (Iceland)</option>
                  <option value="+355">🇦🇱 +355 (Albania)</option>
                  <option value="+356">🇲🇹 +356 (Malta)</option>
                  <option value="+357">🇨🇾 +357 (Cyprus)</option>
                  <option value="+358">🇫🇮 +358 (Finland)</option>
                  <option value="+359">🇧🇬 +359 (Bulgaria)</option>
                  <option value="+370">🇱🇹 +370 (Lithuania)</option>
                  <option value="+371">🇱🇻 +371 (Latvia)</option>
                  <option value="+372">🇪🇪 +372 (Estonia)</option>
                  <option value="+373">🇲🇩 +373 (Moldova)</option>
                  <option value="+374">🇦🇲 +374 (Armenia)</option>
                  <option value="+375">🇧🇾 +375 (Belarus)</option>
                  <option value="+376">🇦🇩 +376 (Andorra)</option>
                  <option value="+377">🇲🇨 +377 (Monaco)</option>
                  <option value="+378">🇸🇲 +378 (San Marino)</option>
                  <option value="+380">🇺🇦 +380 (Ukraine)</option>
                  <option value="+381">🇷🇸 +381 (Serbia)</option>
                  <option value="+382">🇲🇪 +382 (Montenegro)</option>
                  <option value="+383">🇽🇰 +383 (Kosovo)</option>
                  <option value="+385">🇭🇷 +385 (Croatia)</option>
                  <option value="+386">🇸🇮 +386 (Slovenia)</option>
                  <option value="+387">🇧🇦 +387 (Bosnia and Herzegovina)</option>
                  <option value="+389">🇲🇰 +389 (North Macedonia)</option>
                  <option value="+420">🇨🇿 +420 (Czech Republic)</option>
                  <option value="+421">🇸🇰 +421 (Slovakia)</option>
                  <option value="+423">🇱🇮 +423 (Liechtenstein)</option>
                  <option value="+500">🇫🇰 +500 (Falkland Islands)</option>
                  <option value="+501">🇧🇿 +501 (Belize)</option>
                  <option value="+502">🇬🇹 +502 (Guatemala)</option>
                  <option value="+503">🇸🇻 +503 (El Salvador)</option>
                  <option value="+504">🇭🇳 +504 (Honduras)</option>
                  <option value="+505">🇳🇮 +505 (Nicaragua)</option>
                  <option value="+506">🇨🇷 +506 (Costa Rica)</option>
                  <option value="+507">🇵🇦 +507 (Panama)</option>
                  <option value="+508">🇵🇲 +508 (Saint Pierre and Miquelon)</option>
                  <option value="+509">🇭🇹 +509 (Haiti)</option>
                  <option value="+590">🇬🇵 +590 (Guadeloupe)</option>
                  <option value="+591">🇧🇴 +591 (Bolivia)</option>
                  <option value="+592">🇬🇾 +592 (Guyana)</option>
                  <option value="+593">🇪🇨 +593 (Ecuador)</option>
                  <option value="+594">🇬🇫 +594 (French Guiana)</option>
                  <option value="+595">🇵🇾 +595 (Paraguay)</option>
                  <option value="+596">🇲🇶 +596 (Martinique)</option>
                  <option value="+597">🇸🇷 +597 (Suriname)</option>
                  <option value="+598">🇺🇾 +598 (Uruguay)</option>
                  <option value="+599">🇧🇶 +599 (Caribbean Netherlands)</option>
                  <option value="+670">🇹🇱 +670 (Timor-Leste)</option>
                  <option value="+672">🇦🇶 +672 (Australian Antarctic Territory)</option>
                  <option value="+673">🇧🇳 +673 (Brunei)</option>
                  <option value="+674">🇳🇷 +674 (Nauru)</option>
                  <option value="+675">🇵🇬 +675 (Papua New Guinea)</option>
                  <option value="+676">🇹🇴 +676 (Tonga)</option>
                  <option value="+677">🇸🇧 +677 (Solomon Islands)</option>
                  <option value="+678">🇻🇺 +678 (Vanuatu)</option>
                  <option value="+679">🇫🇯 +679 (Fiji)</option>
                  <option value="+680">🇵🇼 +680 (Palau)</option>
                  <option value="+681">🇼🇫 +681 (Wallis and Futuna)</option>
                  <option value="+682">🇨🇰 +682 (Cook Islands)</option>
                  <option value="+683">🇳🇺 +683 (Niue)</option>
                  <option value="+684">🇦🇸 +684 (American Samoa)</option>
                  <option value="+685">🇼🇸 +685 (Samoa)</option>
                  <option value="+686">🇰🇮 +686 (Kiribati)</option>
                  <option value="+687">🇳🇨 +687 (New Caledonia)</option>
                  <option value="+688">🇹🇻 +688 (Tuvalu)</option>
                  <option value="+689">🇵🇫 +689 (French Polynesia)</option>
                  <option value="+690">🇹🇰 +690 (Tokelau)</option>
                  <option value="+691">🇫🇲 +691 (Micronesia)</option>
                  <option value="+692">🇲🇭 +692 (Marshall Islands)</option>
                  <option value="+850">🇰🇵 +850 (North Korea)</option>
                  <option value="+852">🇭🇰 +852 (Hong Kong)</option>
                  <option value="+853">🇲🇴 +853 (Macau)</option>
                  <option value="+855">🇰🇭 +855 (Cambodia)</option>
                  <option value="+856">🇱🇦 +856 (Laos)</option>
                  <option value="+880">🇧🇩 +880 (Bangladesh)</option>
                  <option value="+886">🇹🇼 +886 (Taiwan)</option>
                  <option value="+960">🇲🇻 +960 (Maldives)</option>
                  <option value="+961">🇱🇧 +961 (Lebanon)</option>
                  <option value="+962">🇯🇴 +962 (Jordan)</option>
                  <option value="+963">🇸🇾 +963 (Syria)</option>
                  <option value="+964">🇮🇶 +964 (Iraq)</option>
                  <option value="+965">🇰🇼 +965 (Kuwait)</option>
                  <option value="+966">🇸🇦 +966 (Saudi Arabia)</option>
                  <option value="+967">🇾🇪 +967 (Yemen)</option>
                  <option value="+968">🇴🇲 +968 (Oman)</option>
                  <option value="+970">🇵🇸 +970 (Palestine)</option>
                  <option value="+971">🇦🇪 +971 (UAE)</option>
                  <option value="+972">🇮🇱 +972 (Israel)</option>
                  <option value="+973">🇧🇭 +973 (Bahrain)</option>
                  <option value="+974">🇶🇦 +974 (Qatar)</option>
                  <option value="+975">🇧🇹 +975 (Bhutan)</option>
                  <option value="+976">🇲🇳 +976 (Mongolia)</option>
                  <option value="+977">🇳🇵 +977 (Nepal)</option>
                  <option value="+992">🇹🇯 +992 (Tajikistan)</option>
                  <option value="+993">🇹🇲 +993 (Turkmenistan)</option>
                  <option value="+994">🇦🇿 +994 (Azerbaijan)</option>
                  <option value="+995">🇬🇪 +995 (Georgia)</option>
                  <option value="+996">🇰🇬 +996 (Kyrgyzstan)</option>
                  <option value="+998">🇺🇿 +998 (Uzbekistan)</option>
                </select>
                <input
                  type="tel"
                  value={formData.phoneNo}
                  onChange={(e) => handleInputChange('phoneNo', e.target.value)}
                  placeholder="Enter Mobile Number"
                  className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Address</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Insurance Details */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Insurance Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Id
              </label>
              <input
                type="text"
                value={formData.insuranceId}
                onChange={(e) => handleInputChange('insuranceId', e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider Name
              </label>
              <input
                type="text"
                value={formData.providerName}
                onChange={(e) => handleInputChange('providerName', e.target.value)}
                placeholder="Insurance Provider Name"
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
