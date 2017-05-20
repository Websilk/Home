-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/20/2013 8:25 AM
-- Description:	physically remove all records related to a website
-- =============================================
CREATE PROCEDURE [dbo].[Website_DeletePermanently] 
	@websiteId int = 0,
	@ownerId int = 0
AS
BEGIN
	SET NOCOUNT ON;

	IF (SELECT COUNT(*) FROM websites WHERE websiteid=@websiteId AND ownerid=@ownerId) > 0
	BEGIN

		SELECT pageid INTO #pages FROM pages WHERE websiteid=@websiteId

		-- website tables first
		DELETE FROM Websites WHERE websiteid=@websiteid
		DELETE FROM Pages WHERE websiteid=@websiteid
		DELETE FROM WebsiteSubDomains WHERE websiteid=@websiteid
		DELETE FROM WebsiteDomains WHERE websiteid=@websiteid
		DELETE FROM ApplicationsOwned WHERE websiteid=@websiteid

		--application tables next
		

	END
END
