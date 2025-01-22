const Discord = require("discord.js");
const fs = require('fs');
const path = require('path');
const { token } = require("./config.json");
const { prifix } = require('./config.json');
const config = require('./config.json');
const {
    Client,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    REST,
    MessageButton,
    MessageSelectMenu,
    Routes,
    MessageEmbed,
    ModalBuilder,
    TextInputStyle,
    TextInputBuilder,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ApplicationCommandOptionType,
} = require("discord.js");

const client = new Client({
    intents: [131071],
});




client.once("ready", () => {
    client.user.setActivity({
        name: "Vergin Team:By m7md3rb",
    });

    client.user.setStatus("idle");
    // client.application.commands.create({
    //     name: "or",
    //     description: "ايمبد تسجيل دخول وخروج",
    // }).then(console.log)
    //     .catch(console.err)
    // client.application.commands.fetch().then(console.log)
});


//  Slash Command
const rest = new REST({ version: '10' }).setToken(token);
const commands = [
    {
        name: 'inout',
        description: 'ايمبد تسجيل دخول وخروج',
    },
    {
        name: 'top',
        description: 'توب اكثر ناس عدد ساعات تسجيل دخول',
    },
    {
        name: 'جرد',
        description: 'الجرد الاسبوعي او على كيفك للاداره',
    },
    {
        name: 'rules',
        description: 'قوانين السيرفر',
    },
    {
        name: 'اجازه',
        description: 'قم بكتابه سبب اجازه  ',
        options: [
            {
                type: 3, // STRING type
                name: 'السبب',
                description: 'قم بكتابه سبب اجازه  ',
                required: true,
            },
        ],
    },
    {
        name: 'استقاله',
        description: 'قم بكتابه سبب اسنقاله  ',
        options: [
            {
                type: 3, // STRING type
                name: 'سبب',
                description: 'قم بكتابه سبب استقاله  ',
                required: true,
            },
        ],
    },
];


const jsonFilePath = path.join(__dirname, 'data.json');
let pressTimes = {};

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands, });

        console.log('Successfully reloaded application (/) commands.');

    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'inout') {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "لا تمتلك الصلاحيات اللازمة لاستخدام هذا الأمر.",
                ephemeral: true
            });
        }
        // إنشاء Embed
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle(config.embedTitle)
            .setDescription(config.embedDesc)
            .setImage(config.embedImg)
            .setTimestamp()
            .setThumbnail(config.embedTumb)
            .setFooter({ text: 'By m7md3rb' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('Login').setLabel("تسجيل دخول").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('Logout').setLabel("تسجيل خروج").setStyle(ButtonStyle.Secondary)
        )

        await interaction.reply({ embeds: [embed], components: [row], content: "@everyone" });



    } else if (commandName === 'top') {
        const ownerRoleId = config.ownerRoleId;
        const adminRoleId = config.staffRoleId;
        const highadminRoleId = config.highstaffRoleId;
        const memberRoles = interaction.member.roles.cache.map(role => role.id);
        if (!memberRoles.includes(adminRoleId) && !memberRoles.includes(highadminRoleId) && !memberRoles.includes(ownerRoleId)) {
            return interaction.reply({
                content: "انت لست اداري",
                ephemeral: true
            });
        }
        let data = {};
        if (fs.existsSync(jsonFilePath)) {
            data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        }

        // ترتيب البيانات من الأكثر ساعات إلى الأقل
        const sortedData = Object.entries(data)
            .map(([userId, time]) => ({
                userId,
                hours: time.hours || 0,
                minutes: time.minutes || 0
            }))
            .sort((a, b) => b.hours - a.hours || b.minutes - a.minutes);

        // إنشاء Embed
        const embed = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle("التوب الاداره")
            .setDescription("التوب تسجيل دخول")
            .setTimestamp()
            .setThumbnail(config.embedTumb)
            .setFooter({ text: 'By m7md3rb' });

        // إضافة المعلومات إلى الـ Embed
        sortedData.forEach((entry, index) => {
            embed.addFields({
                name: `#${index + 1} <@${entry.userId}>`,
                value: `ساعات: ${entry.hours}, دقائق: ${entry.minutes}`,
                inline: false
            });
        });

        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'جرد') {
        // التحقق من الصلاحيات
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "معليش لازم ادمنستريتر",
                ephemeral: true
            });
        }

        // حذف ملف data.json
        if (fs.existsSync(jsonFilePath)) {
            fs.unlinkSync(jsonFilePath);
            await interaction.reply({
                content: "تم جرد بنجاح",
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: "مافي داتا يعسل ",
                ephemeral: true
            });
        }
    } else if (commandName === 'rules') {
        if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: "معليش لازم ادمنستريتر",
                ephemeral: true
            });
        }

        const maineEmbedRules = new EmbedBuilder()
        .setColor(config.embedColor)
        .setTitle("قوانين السيرفر")
        .setDescription(`
            ** ### لرؤيه قوانين السيرفر اختر قوانين المدينه 
### لرؤيه قوانين المطاعم اختر  قوانين المطاعم
### لرؤيه المناطق الامنه اضغط على  المناطق الامنه 
### لرؤيه قوانين الاجرام اختر  قوانين الاجرام **
            `)
        .setTimestamp()
        .setImage(config.embedImg)
        .setThumbnail(config.embedTumb)
        .setFooter({ text: 'By m7md3rb', iconURL:"https://cdn.discordapp.com/attachments/1260937941233041419/1273608488186019871/removal.ai_f9a53dda-adf3-4887-b6b8-c6d9337dd7be-rc_logo_1.png?ex=66d8f116&is=66d79f96&hm=ad89e096b4281e45fbf133cdf9ed8d716f245a28107f0174be6df15ff06a5eb3&"  });
        const embedRules = new EmbedBuilder()
            .setColor(config.embedColor)
            .setTitle("قوانين السيرفر")
            .setDescription(`
                - يجب عليك فهم معنى الحياة الواقعية
- يمنع التحدث بالسياسه والاعراض والدين وايضا المضايقات وفي حال تم رصد اياً منها ( باند نهائي )
- يمنع تقليد الكركترات والاسماء الموجوده بالسيرفر بأي طريقة كانت
- يجب وضع اسم كركتر واقعي
- في حال حضرت سيناريو باحدى كركتراتك , يمنع حضور كركتر اخر لك بالسيناريو نفسه
- يمنع دخول البيت او الشقه اثناء السيناريو
- يجب تشغيل برنامج التصوير مع وجود الصوت ( 15-20 د) اثناء اللعب عبر برنامج جيفورس ويجب ان يكون على الشاشة كاملة
- يمنع التدخل في سيناريو قائم
- يمنع لبس الملابس الجيشية والعسكريه ومن ضمنها الحزام العسكري
- يمنع التعرض للمسعفين الا في حال تعرض لك ايضا يمنع سرقة وتدمير اغراض الشرطة والمسعفيين
- تمنع الشخصنة بجميع اشكالها وانواعها
- يمنع التواصل الغير شرعي بجميع انواعه ( Meta Gaming )
- يمنع إرتداء او إستعمال اي خوذة اثناء مشاركتك في اي إطلق ناري
- يمنع استخدام اي جرافيكس او برنامج خارجي او ملفات تساعد او تسهل طريقة اللعب
- يمنع على إي لاعب حرق او تفجير جثة ونقلها , يمنع إهانة اي لاعب بعد قتله
- يمنع تغيير ملامح وجهك او شعرك بعد قيامك بعملية اجرامية منعا باتا
- يمنع على الشخص الميت اثناء السيناريو العودة إليه مره اخرى
- عدم ترابط شخصيتك الاولى , بالشخصية الثانية , يمنع تكرار الاسامي بين الكركترات
- يجب عليك تقمص شخصيتك مع الكل حتى ولو خويك بمعنى لو انك عسكري و خويك مجرم م تتساهل معه ابداً
- في حال عندك شخصيه وبتغير الصوت حقها في اي برنامج يجب ان الصوت يبقى ثابت على هذي الشخصيه او الكاركتر
للمشاكل الخارجه عن الاربي ويمنع السواليف فيه /ooc
- يجب عليك تقدير قيمة مركبتك والقيادة بشكل سليم و تجنب صدم الاخرين
- في حال اغمى عليك لايمكنك التحدث بشكل طبيعي ويجب عليك تقمص الحالة , وعند الموت يجب عليك التعبير عن الالم فقط
- الكذب بالمسطلحات التالية { سحر او باخذ حبه او صداع والخ } .. يعرضك للمحاسبة الادارية
- ممنوع الكلام المشفر بجميع انواعه بمعنى ) اي كلام له اكثر من معنى ممنوع
- يمنع منعاً باتا استخدام ادوات الغش كالقلتشات او الثغرات او استغلال اوامر الشات ( باند نهائي )
- عند الموت او التحلل يجب عليك نسيان الاشخاص المتسببين بذلك فقط
- ممنوع الستريم سنايب ( باند نهائي )
-عند حدوث اعادة تشغيل للسيرفر { اعصار } وكنت تحت رهن الاعتقال يجب عليك الرجوع وتسليم نفسك لمركز الشرطة و ان كنت رهينه في سناريو تكمل السناريو بعد اعادة التشغيل السيرفر
- يمنع منعا باتا التحدث عن امور خارج الرول بلاي او التلميح لها
- يجب الالتزام بالذوق العام في الملابس بشكل كامل
- خروجك من السيرفر اثناء سيناريو جاري يعرضك للمحاسبة الادارية
- في الحالات الجنائية و تم اسقاطك يجب عليك الانتظار حتى الانعاش من الطرف الاخر او في حال تم اخلاء الموقع بشكل كامل يجب عليك الانتظار 5د بعد ذلك يمكنك الذهاب للمستشفى.
- لا يسمح بإرتداء عدة الغوص خارج البحر ومن يخالف ذلك سيتم محاسبته
                `)
            .setTimestamp()
            .setThumbnail(config.embedTumb)
            .setFooter({ text: 'By m7md3rb'});

            const rowRules = new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId('rule_select')
                .setPlaceholder('اختر نوع القوانين')
                .addOptions([
                    {
                        label: 'قوانين المدينه ',
                        value: 'rule_type_1',
                        description: 'هنا كل مايخص قوانين الاجرام',
                    },
                  {
                    label: 'قوانين المطاعم',
                    value: 'rule_type_2',
                    description: 'هنا يخص كل مافي قوانين المدينه',
                  },
                  {
                    label: 'المناطق الامنه',
                    value: 'rule_type_3',
                    description: 'هنا المناطق الامنه',
                  },
                  {
                    label: 'قوانين الاجرام ',
                    value: 'rule_type_4',
                    description: 'هنا كل مايخص قوانين الاجرام',
                  },
                ]),
            );

            interaction.channel.send({content : `@everyone`, embeds: [maineEmbedRules], components : [rowRules]})

    } else if (commandName === 'اجازه') {
        const { commandName, options } = interaction;
        const reason = options.getString('السبب');
        const user = interaction.user;
        const userAvatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });
        const ownerRoleId = config.ownerRoleId;
        const adminRoleId = config.staffRoleId;
        const highadminRoleId = config.highstaffRoleId;
        const memberRoles = interaction.member.roles.cache.map(role => role.id);
        if (!memberRoles.includes(adminRoleId) && !memberRoles.includes(highadminRoleId) && !memberRoles.includes(ownerRoleId)) {
            return interaction.reply({
                content: "انت لست اداري",
                ephemeral: true
            });
        }

        const logChannel = client.channels.cache.get(config.vacationRoomId);
        if (!logChannel) {
            return interaction.reply('Log channel not found!');
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('تقديم اجازه')
            .setDescription(`User: <@${user.id}>\nReason: ${reason}`)
            .setTimestamp()
            .setThumbnail(userAvatarURL)
            ;

        await logChannel.send({ content: `<@${user.id}>`, embeds: [embed] });
        await interaction.reply({content:'تم ارسال طلب اجازتك بنجاح', ephemeral: true});
    }else if (commandName === 'استقاله') {
        const { commandName, options } = interaction;
        const reason = options.getString('سبب');
        const user = interaction.user;
        const userAvatarURL = user.displayAvatarURL({ format: 'png', dynamic: true });
        const ownerRoleId = config.ownerRoleId;
        const adminRoleId = config.staffRoleId;
        const highadminRoleId = config.highstaffRoleId;
        const memberRoles = interaction.member.roles.cache.map(role => role.id);
        if (!memberRoles.includes(adminRoleId) && !memberRoles.includes(highadminRoleId) && !memberRoles.includes(ownerRoleId)) {
            return interaction.reply({
                content: "انت لست اداري",
                ephemeral: true
            });
        }

        const logChannel = client.channels.cache.get(config.vacationRoomId);
        if (!logChannel) {
            return interaction.reply('Log channel not found!');
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('تقديم استقاله')
            .setDescription(`User: <@${user.id}>\nReason: ${reason}`)
            .setTimestamp()
            .setThumbnail(userAvatarURL)
            ;

        await logChannel.send({ content: `<@${user.id}>`, embeds: [embed] });
        await interaction.reply({content:'تم ارسال طلب استقالتك بنجاح', ephemeral:true});
    }

});

client.on("interactionCreate", async (interaction) => {
     if (interaction.isStringSelectMenu()) {
        const { customId, values } = interaction;

        if (customId === 'rule_select') {
            const ruleDescriptions = {
                'rule_type_1': `### - يجب عليك فهم معنى الحياة الواقعية
### - يمنع التحدث بالسياسه والاعراض والدين وايضا المضايقات وفي حال تم رصد اياً منها ( باند نهائي )
### - يمنع تقليد الكركترات والاسماء الموجوده بالسيرفر بأي طريقة كانت
### - يجب وضع اسم كركتر واقعي
### - في حال حضرت سيناريو باحدى كركتراتك , يمنع حضور كركتر اخر لك بالسيناريو نفسه
### - يمنع دخول البيت او الشقه اثناء السيناريو
### - يجب تشغيل برنامج التصوير مع وجود الصوت ( 15-20 د) اثناء اللعب عبر برنامج جيفورس ويجب ان يكون على الشاشة كاملة
### - يمنع التدخل في سيناريو قائم
### - يمنع لبس الملابس الجيشية والعسكريه ومن ضمنها الحزام العسكري
### - يمنع التعرض للمسعفين الا في حال تعرض لك ايضا يمنع سرقة وتدمير اغراض الشرطة والمسعفيين
### - تمنع الشخصنة بجميع اشكالها وانواعها
### - يمنع التواصل الغير شرعي بجميع انواعه ( Meta Gaming )
### - يمنع إرتداء او إستعمال اي خوذة اثناء مشاركتك في اي إطلق ناري
### - يمنع استخدام اي جرافيكس او برنامج خارجي او ملفات تساعد او تسهل طريقة اللعب
### - يمنع على إي لاعب حرق او تفجير جثة ونقلها , يمنع إهانة اي لاعب بعد قتله
### - يمنع تغيير ملامح وجهك او شعرك بعد قيامك بعملية اجرامية منعا باتا
### - يمنع على الشخص الميت اثناء السيناريو العودة إليه مره اخرى
### - عدم ترابط شخصيتك الاولى , بالشخصية الثانية , يمنع تكرار الاسامي بين الكركترات
### - يجب عليك تقمص شخصيتك مع الكل حتى ولو خويك بمعنى لو انك عسكري و خويك مجرم م تتساهل معه ابداً
### - في حال عندك شخصيه وبتغير الصوت حقها في اي برنامج يجب ان الصوت يبقى ثابت على هذي الشخصيه او الكاركتر
### - للمشاكل الخارجه عن الاربي ويمنع السواليف فيه /ooc
### - يجب عليك تقدير قيمة مركبتك والقيادة بشكل سليم و تجنب صدم الاخرين
### - في حال اغمى عليك لايمكنك التحدث بشكل طبيعي ويجب عليك تقمص الحالة , وعند الموت يجب عليك التعبير عن الالم فقط
### - الكذب بالمسطلحات التالية { سحر او باخذ حبه او صداع والخ } .. يعرضك للمحاسبة الادارية
### - ممنوع الكلام المشفر بجميع انواعه بمعنى ) اي كلام له اكثر من معنى ممنوع
### - يمنع منعاً باتا استخدام ادوات الغش كالقلتشات او الثغرات او استغلال اوامر الشات ( باند نهائي )
### - عند الموت او التحلل يجب عليك نسيان الاشخاص المتسببين بذلك فقط
### - ممنوع الستريم سنايب ( باند نهائي )
### - عند حدوث اعادة تشغيل للسيرفر { اعصار } وكنت تحت رهن الاعتقال يجب عليك الرجوع وتسليم نفسك لمركز الشرطة و ان كنت رهينه في سناريو تكمل السناريو بعد اعادة التشغيل السيرفر
### - يمنع منعا باتا التحدث عن امور خارج الرول بلاي او التلميح لها
### - يجب الالتزام بالذوق العام في الملابس بشكل كامل
### - خروجك من السيرفر اثناء سيناريو جاري يعرضك للمحاسبة الادارية
### - في الحالات الجنائية و تم اسقاطك يجب عليك الانتظار حتى الانعاش من الطرف الاخر او في حال تم اخلاء الموقع بشكل كامل يجب عليك الانتظار 5د بعد ذلك يمكنك الذهاب للمستشفى.
### - لا يسمح بإرتداء عدة الغوص خارج البحر ومن يخالف ذلك سيتم محاسبته`,
                
                
                'rule_type_2': `### - واجب على جميع المواطنين احترام المطاعم بشكل كامل وتقدير الموظفين اثناء عملهم وعدم الاسائه لهم بكل الطرق
### - يجب على الجميع التقيد باسعار الوجبات وعدم الاصرار والمفاوضة وازعاج الموظفين
### - يمنع منعا باتا لبس ملابس موظفين المطاعم والتحايل بكونك موظف فالمطعم
### - يمنع منعا باتا الوقوف بشكل خاطئ في مواقف المطاعم ويجب الالتزام بالمواقف المحدده للمطعم ويحق للموظف ابلاغ الشرطة وعدم البيع
### - يجب على الجميع احترام المطعم والوقوف بشكل منظم لحصولك على الطعام
### - اسعار الوجبات قابلة للتغير بشكل مستمر ويجب عليك الاطلاع بشكل دوري
### - البيع فقط داخل المطاعم ولايحق للمواطن طلب وجبات خارج المطعم
### - يمنع منعا باتا سرقة موظفين المطاعم واخذ وجباتهم
### - يمنع منعا باتا في حال لست موظف التجارة بوجبات المطاعم والبيع والشراء
### - يمنع خطف موظفين المطاعم في اوقات عملهم الرسمية ويندرج تحت ذلك ( عربة بيع الطعام )`,
                

                'rule_type_3': `** ### - الحديقة العامة
### - البنر
### - المستشفى
### - مراكز الشرطة
### - ورشات التصليح
### - جميع المطاعم والمقاهي
### - منطقة تجميع الموارد
### - منطقة استبدال الموارد
### - المحكمة
### - السجن
### - اماكن الوظائف ومواقع البيع والتسليم للوظائف
### - الحجز **
(وما حول جميع هذه المناطق أعلاه)


** ### يمنع خطف شخص في مكان عام يتواجد به المدنيين أو المواطنين إلا في حال تم تهديده قبلها وهرب إلى أحد المناطق الآمنه ماعدا مركز الشرطة
### يمنع منعاً باتاً خطف رهينة أمام المواطنين يجب استدراج الرهينة قبل الخطف بأي طريقة كانت إلى اماكن بعيده عن أنظار المواطنين **`,

                'rule_type_4': `### - عدد افراد العصابه لا يقل عن 6 افراد ولا يزيد عن 25
### - تمنع الشخصنة بجميع اشكالها داخل او خارج الرول بلاي بين العصابات وعقوبتها بالباند النهائي للعصابه كامله
### - يمنع عليك تقليد لبس العصابة او الاستهزاء ونسب نفسك لعصابة ولست عضو رسمي
### - في حال وجود شكوى على عصابة او عضو عصابة توجه الشكوى للدعم الفني في حينها ولن يتم قبول اي شكوى تجاوزت مدتها 48 ساعه من وقت حدوثها
### - العداوات بين العصابات تنشأ بعد اكثر من موقف قوي يستدعي حدوث عداوة
### - يجب على اعضاء العصابات التقيد باللبس الرسمي اثناء اي عمل اجرامي ضد الشرطة او مجموعة او اعصابة اخرى وتطبيق الرول بلاي بحذافيره وبشكل محترف يسمح الاحتماء بالمقرات اثناء مطاردة واستخدام المقر للاشتباكات " لاكن تحمل كامل المسؤوليه".
### - في حال دخل مواطن لمقر العصابه وتم تنبيه بالمغادره وقام بالرجوع وعدم الخوف يحق لكم خطفه وسرقته , لاكن بشرط ان لايكون سناريو قائم
### - يحق للعصابات الدفاع عن ممتلكاتهم او مقرهم في حال وجود مداهمة عسكرية
### - في حال معرفه اعضاء الشرطة والاف بي اي مكان العصابه او مكان مستودعات العصابه لها الحق في الاقتحام
### - في حال كثرت المخالفات على اعضاء العصابة يتم اعطاء تحذير من (مسؤول العصابات) وايقاف العصابة للمرة الاولى وفي المرة الثانية يتم اقفال العصابة ، ايضا في حال تغيب العصابه عن السيرفر سيتم استبعادها.
### - عند محاولتك استفزاز العصابة بمنطقتها ستكون المسؤول عن اي مشكلة تحدث بعد ذلك والشرطة تخلي مسؤوليتها من اي حدث داخل مناطق العصابات
### - يمنع تقمص دور عصابة اخرى.
### - يحق للشرطة مداهمة الاماكن التي يتم رصدها بعد إثبات جرمها
### - يمنع بشكل نهائي هدنة العصابات بمعنى { ما راح نقرب من بعض } من يرصد عليه هذا الشيء تفرض عليه عقوبات
الاحترام الكامل لمسؤولين العصابات (in rp)
### - يمنع منعا باتا التلويت لاي عصابة في اي فايت غير رسمي " فايت بدون بخاخات "
### - كل عضو في العصابة يمثل العصابة بأكملها
### - في حال دخول العسكر لمقر العصابة يسمح بتلويتهم م عدا اغراض العسكر مثال : (الاسلحه . الباج .التيزر . و الكلبشه العسكريه و غيرها من الاغراض العسكرية)
### - احترامك لمسؤول العصابات مهما كانت الظروف حتى وان كانت بلحظه غضب تجنبا لمحاسبه العصابه كامله`,
            };
            const ruleTitle = {
                'rule_type_1': ' قوانين المدينة',
                'rule_type_2': ' قوانين المطاعم',
                'rule_type_3': ' المناطق الامنة',
                'rule_type_4': ' قوانين الاجرام',
            };

            const selectedValue = values[0];
            const embedDescription = ruleDescriptions[selectedValue] || 'لم يتم تحديد قانون.';
            const embedTitle = ruleTitle[selectedValue] || 'لم يتم تحديد قانون.';

            const embed = new EmbedBuilder()
                .setColor('#0000ff')
                .setTitle(embedTitle)
                .setDescription(embedDescription)
                .setTimestamp()
                .setImage("https://cdn.discordapp.com/attachments/1260937941233041419/1273485229524258942/Screenshot_2024-08-15_073332.png?ex=66d9270a&is=66d7d58a&hm=db068a6f9470f0b7d949e57e38a8e329ec9888b54bbba130b4c6151fece19dbf&");
                

            await interaction.reply({
                embeds: [embed],
                components: [], // إلغاء القائمة المنسدلة بعد الاختيار
                ephemeral: true,
                
            });
        }
    }

})
const staffRoomId = require("./config.json").staffRoomIdd;

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
        const { customId, member } = interaction;

        if (interaction.customId == "Login") {
            const ownerRoleId = config.ownerRoleId;
            const highAdminRoleId = config.highstaffRoleId;
            const adminRoleId = config.staffRoleId;
            const memberRoles = interaction.member.roles.cache.map(role => role.id);
            if (!memberRoles.includes(adminRoleId) && !memberRoles.includes(highAdminRoleId) && !memberRoles.includes(ownerRoleId)) {
                return interaction.reply({
                    content: "انت لست اداري",
                    ephemeral: true
                });
            }

            const role = interaction.guild.roles.cache.get(config.byServiceId);
            if (role) {
                await member.roles.add(role);
            } 

            const userId = interaction.user.id;
            pressTimes[userId] = { start: Date.now() };
            const staffRoom = await client.channels.fetch(staffRoomId);
            staffRoom.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.embedColor)
                        .setTitle("تسجيل دخول")
                        .setDescription(`<@${userId}> لقد قام بتسجيل دخوله`)
                        .setTimestamp()
                        .setThumbnail(config.embedTumb)
                        .setFooter({ text: 'By m7md3rb' })]
            });
            interaction.reply({
                content: " تم تسجيل دخولك بنجاح وتم اعطائك رتبه بنجاح",
                ephemeral: true,
            });
        };

    };

    if (interaction.isButton()) {
        const { customId, member } = interaction;
        if (interaction.customId == "Logout") {
            const ownerRoleId = config.ownerRoleId;
            const highAdminRoleId = config.highstaffRoleId;
            const adminRoleId = config.staffRoleId;
            const memberRoles = interaction.member.roles.cache.map(role => role.id);
            if (!memberRoles.includes(adminRoleId) && !memberRoles.includes(highAdminRoleId) && !memberRoles.includes(ownerRoleId)) {
                return interaction.reply({
                    content: " انت لست اداري",
                    ephemeral: true
                });
            }
            const role = interaction.guild.roles.cache.get(config.byServiceId);
            if (role) {
                await member.roles.remove(role);
            }
            const userId = interaction.user.id;
            if (pressTimes[userId] && pressTimes[userId].start) {
                const endTime = Date.now();
                const duration = endTime - pressTimes[userId].start; // الفرق بين وقت البدء ووقت الانتهاء

                const durationHours = Math.floor(duration / (1000 * 60 * 60));
                const durationMinutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

                let data = {};
                if (fs.existsSync(jsonFilePath)) {
                    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
                    if (fileContent.trim() !== "") {
                        try {
                            // محاولة قراءة وتحليل محتوى ملف JSON
                            data = JSON.parse(fileContent);
                        } catch (error) {
                            // معالجة الأخطاء إذا كان ملف JSON تالفًا أو غير قابل للتحليل
                            console.error("Error reading or parsing JSON file:", error);
                            // تعيين البيانات إلى كائن فارغ لتجنب تعطل البرنامج
                            data = {};
                        }
                    }
                }

                // تحديث البيانات المخزنة
                if (data[userId]) {
                    const oldHours = data[userId].hours || 0;
                    const oldMinutes = data[userId].minutes || 0;

                    // إضافة الوقت الجديد إلى القديم
                    const totalHours = oldHours + durationHours;
                    const totalMinutes = oldMinutes + durationMinutes;

                    // معالجة تجاوز الدقائق إلى ساعات
                    const extraHours = Math.floor(totalMinutes / 60);
                    const finalHours = totalHours + extraHours;
                    const finalMinutes = totalMinutes % 60;
                    data[userId] = { hours: finalHours, minutes: finalMinutes };
                } else {
                    data[userId] = { hours: durationHours, minutes: durationMinutes };
                }

                // حفظ البيانات في ملف JSON
                fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2));

                delete pressTimes[userId];
            }
            const staffRoom = await client.channels.fetch(staffRoomId);
            staffRoom.send({
                embeds: [new EmbedBuilder()
                    .setColor(config.embedColor)
                    .setTitle("تسجيل خروج")
                    .setDescription(`<@${userId}>لقد قام بتسجيل خروجه`)
                    .setTimestamp()
                    .setThumbnail(config.embedTumb)
                    .setFooter({ text: 'By m7md3rb' })]
            });
            interaction.reply({
                content: " تم تسجيل خروجك بنجاح وتم ازاله الرتبه",
                ephemeral: true,
            });
        }
    }
})





client.login(token).then(() => {
    console.log(` ${client.user.tag} its working , This BOT Created By : m7md3rb`)
}).catch((err) => {
    console.log(err)
});;


