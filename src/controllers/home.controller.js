/**
 * Home controller — handles GET /.
 * Thin: no business logic here. Later, if this page needs data,
 * we'll call a service; the template just renders data it receives.
 */
export const renderHomePage = (req, res) => {
    res.render('home', {
        pageTitle: 'Islamic Guidance and Knowledge Platform',
    });
};